import { useSyncExternalStore } from 'react';

/**
 * In-memory journal store. Entries are shared by the Journal tab, the entry
 * detail screen, free write and the check-in flow, and reset on every reload.
 *
 * TODO: replace with the journal API. Nothing here is persisted.
 *
 * Entry shape:
 *   { id, mood: 'Rough'|'Mixed'|'Okay'|'Good'|null, createdAt: Date,
 *     kind: 'prompted'|'free', parts: [{ prompt?: string, text: string }] }
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

function daysAgoAt(days, hours, minutes) {
	const d = startOfDay(new Date());
	d.setDate(d.getDate() - days);
	d.setHours(hours, minutes, 0, 0);
	// A seeded "today" time that hasn't happened yet would sort above anything
	// the user writes now, so clamp it into the past.
	const latest = Date.now() - 60 * 1000;
	return d.getTime() > latest ? new Date(latest) : d;
}

/**
 * Day 1 of BMT, placed so that today reads "Day 23" — matching the dashboard's
 * placeholder "Day 23 · Week 4 of 9".
 */
export const BMT_START = (() => {
	const d = startOfDay(new Date());
	d.setDate(d.getDate() - 22);
	return d;
})();

export function bmtDay(date) {
	return Math.round((startOfDay(date) - BMT_START) / DAY_MS) + 1;
}

/** Seeded with the four entries drawn in M1 (node 28:2); the first is M3's (29:2). */
const SEED = [
	{
		id: 'seed-1',
		mood: 'Rough',
		createdAt: daysAgoAt(0, 22, 14),
		kind: 'prompted',
		parts: [
			{
				prompt:
					'What was the hardest part of today — was it the training itself, or something else?',
				text: "Route march was fine. It's more that everyone else seems to already know each other and I don't really talk to anyone. Bunk is loud but I'm not part of it.\n\nProbably sounds stupid written down.",
			},
			{
				prompt: "Has there been anyone in your section you've spoken to, even briefly?",
				text: "Wei Jie, a bit. He's alright.",
			},
		],
	},
	{
		id: 'seed-2',
		mood: 'Good',
		createdAt: daysAgoAt(1, 21, 48),
		kind: 'prompted',
		parts: [
			{
				prompt: "What clicked today that hadn't before?",
				text: "Finally got the field pack packing down under time. Sergeant didn't say anything but I know he noticed.",
			},
		],
	},
	{
		id: 'seed-3',
		mood: 'Mixed',
		createdAt: daysAgoAt(1, 13, 2),
		kind: 'free',
		parts: [
			{
				text: "Booked out this weekend. Counting down already, which probably isn't the point but there it is.",
			},
		],
	},
	{
		id: 'seed-4',
		mood: 'Good',
		createdAt: daysAgoAt(3, 20, 30),
		kind: 'prompted',
		parts: [
			{
				prompt: 'Who or what made today more manageable?',
				text: 'Wei Jie shared his snacks during the break.',
			},
		],
	},
];

let entries = sortNewestFirst(SEED);
const listeners = new Set();

function sortNewestFirst(list) {
	return [...list].sort((a, b) => b.createdAt - a.createdAt);
}

function emit() {
	for (const listener of listeners) listener();
}

function subscribe(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

// A new array on every change, so useSyncExternalStore sees a new snapshot.
function getSnapshot() {
	return entries;
}

let counter = 0;

export function add(entry) {
	const created = {
		id: `entry-${Date.now()}-${counter++}`,
		createdAt: new Date(),
		mood: null,
		...entry,
	};
	entries = sortNewestFirst([created, ...entries]);
	emit();
	return created;
}

export function remove(id) {
	entries = entries.filter((e) => e.id !== id);
	emit();
}

export function get(id) {
	return entries.find((e) => e.id === id);
}

export function useJournal() {
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Fixed tables rather than toLocaleDateString: its output varies by engine
// (Node's en-GB gives "Sept"; Hermes' Intl support differs again), and the
// frame's format is exactly three letters.
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Today" / "Yesterday" / "Sun 12 Oct" — the day headings in M1 (node 28:19). */
export function dayLabel(date) {
	const diff = Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY_MS);
	if (diff === 0) return 'Today';
	if (diff === 1) return 'Yesterday';
	return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** 24-hour "22:14", as M1 and M3 show it. */
export function timeLabel(date) {
	const h = String(date.getHours()).padStart(2, '0');
	const m = String(date.getMinutes()).padStart(2, '0');
	return `${h}:${m}`;
}

/** Group entries under their day, newest day first. */
export function groupByDay(list) {
	const groups = [];
	for (const entry of list) {
		const key = startOfDay(entry.createdAt).getTime();
		const last = groups[groups.length - 1];
		if (last && last.key === key) last.entries.push(entry);
		else groups.push({ key, date: entry.createdAt, entries: [entry] });
	}
	return groups;
}
