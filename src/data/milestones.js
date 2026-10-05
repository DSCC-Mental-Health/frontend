import { BMT_START, DAY_MS, WEEKDAY_NAMES, bmtDay, isSameDay, startOfDay } from './dates';

/**
 * The BMT milestone schedule — the one list Home's strip, the timeline and the
 * milestone reflections (U1–U5) all read.
 *
 * TODO: placeholder schedule. `day` is the BMT day it starts, placed so Live
 * firing is today and Field camp starts tomorrow (matching the dashboard's
 * "Day 23"); `days` is how long it runs (default 1). Real dates should come
 * from the schedule entered at setup. `sampleMood` / `sampleNote` stand in for
 * past milestones nobody has reflected on yet.
 */
export const MILESTONES = [
	{
		id: 'confinement',
		title: 'Confinement',
		day: 1,
		sampleMood: 'Mixed',
		sampleNote: '5 entries. Mostly about missing home.',
	},
	{
		id: 'march-4km',
		title: 'First 4 km route march',
		day: 10,
		sampleMood: 'Rough',
		sampleNote: 'Two rough days either side of it.',
	},
	{
		id: 'soc',
		title: 'SOC',
		day: 17,
		sampleMood: 'Mixed',
		sampleNote: 'Tense before, okay after.',
	},
	{ id: 'live-firing', title: 'Live firing', day: 23 },
	{ id: 'field-camp', title: 'Field camp', day: 24, days: 5 },
	{ id: 'march-16km', title: '16 km march', day: 45 },
];

export function getMilestone(id) {
	return MILESTONES.find((m) => m.id === id);
}

export function milestoneDate(milestone) {
	const d = new Date(BMT_START);
	d.setDate(d.getDate() + milestone.day - 1);
	return d;
}

export function milestoneWeek(milestone) {
	return Math.ceil(milestone.day / 7);
}

/** BMT day of the milestone's last day. */
export function lastDay(milestone) {
	return milestone.day + (milestone.days ?? 1) - 1;
}

/** Days from today to the milestone's start: 0 today, 1 tomorrow, -1 yesterday. */
export function daysUntil(milestone, now = new Date()) {
	return milestone.day - bmtDay(now);
}

/** Days since the milestone's last day: 0 it ends today, 1 it ended yesterday. */
export function daysSinceEnd(milestone, now = new Date()) {
	return bmtDay(now) - lastDay(milestone);
}

export function isOver(milestone, now = new Date()) {
	return daysSinceEnd(milestone, now) > 0;
}

/** A title mid-sentence: "live firing", but "SOC" stays as it is. */
export function inSentence(title) {
	if (title === title.toUpperCase()) return title;
	return title[0].toLowerCase() + title.slice(1);
}

/** "Today", "Tomorrow", "In 6 days", "Day 2 of 5", "Yesterday", "3 days ago". */
export function relativeLabel(milestone, now = new Date()) {
	const n = daysUntil(milestone, now);
	const length = milestone.days ?? 1;
	if (length > 1 && n <= 0 && !isOver(milestone, now)) return `Day ${1 - n} of ${length}`;
	if (n === 0) return 'Today';
	if (n === 1) return 'Tomorrow';
	if (n > 1) return `In ${n} days`;
	// Past: count from when it ended, not when it started.
	const ago = daysSinceEnd(milestone, now);
	return ago === 1 ? 'Yesterday' : `${ago} days ago`;
}

// ---------------------------------------------------------------------------
// Reflection options (U2, U3, U5)

/** U2 "Compared to what you expected" — five choices instead of the slider. */
export const EXPECTATIONS = [
	{ value: 1, label: 'Much harder', result: 'Much harder than you expected', short: 'Much harder than expected' },
	{ value: 2, label: 'Harder', result: 'Harder than you expected', short: 'Harder than expected' },
	{ value: 3, label: 'As expected', result: 'About what you expected', short: 'About as expected' },
	{ value: 4, label: 'Easier', result: 'Easier than you expected', short: 'Easier than expected' },
	{ value: 5, label: 'Much easier', result: 'Much easier than you expected', short: 'Much easier than expected' },
];

export function expectationOf(value) {
	return EXPECTATIONS.find((e) => e.value === value);
}

/** U3 "What stood out?" */
export const STOOD_OUT = [
	'The noise',
	'Kept my hands steady',
	'Section had my back',
	"Sergeant's briefing helped",
	'Shaky afterwards',
	'Did better than I thought',
	'Still not confident',
	'Wanted it over with',
];

/** U5 "How are you feeling about it?" */
export const FEELINGS = ['Dreading it', 'Nervous', 'Ready enough', 'Looking forward'];

/** U5 "What's on your mind about it?" — generic enough for any milestone. */
export const CONCERNS = [
	'Sleeping outside',
	'The heat',
	'Not enough food',
	'Being cut off from home',
	'Letting my section down',
];

// ---------------------------------------------------------------------------
// Saved answers. Reflections and expectations are journal entries with
// `kind: 'reflection' | 'expectation'`, a `milestoneId` and structured
// `answers`, so these read them back out of the journal list.

export function reflectionFor(entries, milestoneId) {
	return entries.find((e) => e.kind === 'reflection' && e.milestoneId === milestoneId);
}

export function expectationFor(entries, milestoneId) {
	return entries.find((e) => e.kind === 'expectation' && e.milestoneId === milestoneId);
}

/** The mood a milestone shows on Home and the timeline: saved, else sample, else none. */
export function milestoneMood(entries, milestone, now = new Date()) {
	const saved = reflectionFor(entries, milestone.id);
	if (saved) return saved.mood;
	return isOver(milestone, now) ? (milestone.sampleMood ?? null) : null;
}

/**
 * Reflections made before `milestoneId`'s that were easier than expected, most
 * recent first, stopping at the first one that wasn't. Backs "That's the
 * third time" (U2) and "Third time running" (U4).
 */
export function easierRun(entries, excludeMilestoneId) {
	const reflections = entries
		.filter((e) => e.kind === 'reflection' && e.milestoneId !== excludeMilestoneId)
		.sort((a, b) => b.createdAt - a.createdAt);
	const run = [];
	for (const r of reflections) {
		if (r.answers?.expectation >= 4) run.push(r);
		else break;
	}
	return run;
}

/** All reflections that came out easier than expected — backs U5's "From your own logs". */
export function easierCount(entries) {
	return entries.filter((e) => e.kind === 'reflection' && e.answers?.expectation >= 4).length;
}

/** "You said you were nervous about this on Tuesday." — from a saved U5 answer. */
export function expectationQuote(entries, milestoneId, now = new Date()) {
	const saved = expectationFor(entries, milestoneId);
	if (!saved?.answers?.feeling) return null;
	const when = isSameDay(saved.createdAt, now)
		? 'earlier today'
		: `on ${WEEKDAY_NAMES[saved.createdAt.getDay()]}`;
	return `You said you were ${saved.answers.feeling.toLowerCase()} about this ${when}.`;
}

const ORDINALS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'];
export function ordinal(n) {
	return ORDINALS[n] ?? `${n}th`;
}

// ---------------------------------------------------------------------------
// Prompts on Home (U1, and the before-the-event offer for U5)

/** "Not tonight" / "Not now" — remembered per milestone per day, in memory. */
const dismissed = new Set();

function dismissKey(kind, milestoneId, now) {
	return `${kind}:${milestoneId}:${startOfDay(now).getTime() / DAY_MS}`;
}

export function dismissPrompt(kind, milestoneId, now = new Date()) {
	dismissed.add(dismissKey(kind, milestoneId, now));
}

/**
 * The one prompt Home should show now, or null. A reflection is offered on a
 * milestone's last day and the day after ("Steady will stop asking about this
 * one after tomorrow"), today's before yesterday's; otherwise an expectation is
 * offered the day before one starts.
 */
export function duePrompt(entries, now = new Date()) {
	const reflect = MILESTONES.filter(
		(m) =>
			[0, 1].includes(daysSinceEnd(m, now)) &&
			!reflectionFor(entries, m.id) &&
			!dismissed.has(dismissKey('reflect', m.id, now)),
	).sort((a, b) => daysSinceEnd(a, now) - daysSinceEnd(b, now));
	if (reflect.length > 0) {
		const m = reflect[0];
		return { kind: 'reflect', milestone: m, lastChance: daysSinceEnd(m, now) === 1 };
	}
	for (const m of MILESTONES) {
		if (
			daysUntil(m, now) === 1 &&
			!expectationFor(entries, m.id) &&
			!dismissed.has(dismissKey('expect', m.id, now))
		) {
			return { kind: 'expect', milestone: m };
		}
	}
	return null;
}
