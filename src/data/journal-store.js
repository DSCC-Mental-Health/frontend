import { useSyncExternalStore } from 'react';
import { daysAgoAt, startOfDay } from './dates';

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

// Re-exported so existing screens keep importing date helpers from here.
export { BMT_START, bmtDay, dayLabel, timeLabel } from './dates';

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

/** Replaces an entry's answers (M3 edit). Prompts stay as they were asked. */
export function update(id, texts) {
	entries = entries.map((e) =>
		e.id === id
			? { ...e, parts: e.parts.map((part, i) => ({ ...part, text: texts[i] ?? part.text })) }
			: e,
	);
	emit();
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
