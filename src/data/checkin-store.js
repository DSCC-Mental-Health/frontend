import { useSyncExternalStore } from 'react';
import {
	BMT_START,
	WEEKDAY_NAMES,
	dayKey,
	daysAgoAt,
	isSameDay,
	startOfDay,
	timeLabel,
} from './dates';
import { get as getEntry } from './journal-store';

/**
 * In-memory mood check-ins. A check-in is recorded the moment a mood chip on
 * Home is tapped; anything written afterwards becomes a journal entry linked
 * through `entryId`. Resets on every reload.
 *
 * TODO: replace with the check-in API. Nothing here is persisted.
 *
 * Check-in shape: { id, mood: 'Rough'|'Mixed'|'Okay'|'Good', createdAt: Date, entryId: string|null }
 */

/** A check-in that shares its time and mood with a seeded journal entry. */
function fromEntry(id, entryId) {
	const entry = getEntry(entryId);
	return { id, mood: entry.mood, createdAt: entry.createdAt, entryId };
}

/**
 * A sample week shaped like the S2 frame (node 178:2): several days with more
 * than one check-in, and the seeded journal entries as the ones with writing.
 */
const SEED = [
	{ id: 'c-1', mood: 'Good', createdAt: daysAgoAt(5, 21, 30), entryId: null },
	{ id: 'c-2', mood: 'Mixed', createdAt: daysAgoAt(4, 13, 10), entryId: null },
	{ id: 'c-3', mood: 'Rough', createdAt: daysAgoAt(4, 21, 5), entryId: null },
	fromEntry('c-4', 'seed-4'),
	{ id: 'c-5', mood: 'Rough', createdAt: daysAgoAt(2, 12, 40), entryId: null },
	{ id: 'c-6', mood: 'Rough', createdAt: daysAgoAt(2, 18, 0), entryId: null },
	{ id: 'c-7', mood: 'Mixed', createdAt: daysAgoAt(2, 21, 50), entryId: null },
	fromEntry('c-8', 'seed-3'),
	fromEntry('c-9', 'seed-2'),
	fromEntry('c-10', 'seed-1'),
];

let checkins = [...SEED].sort((a, b) => a.createdAt - b.createdAt);
const listeners = new Set();

function emit() {
	for (const listener of listeners) listener();
}

function subscribe(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

// A new array on every change, so useSyncExternalStore sees a new snapshot.
function getSnapshot() {
	return checkins;
}

let counter = 0;

/** Records a mood now. Returns the check-in so writing can be linked to it. */
export function add(mood) {
	const created = {
		id: `checkin-${Date.now()}-${counter++}`,
		mood,
		createdAt: new Date(),
		entryId: null,
	};
	checkins = [...checkins, created];
	emit();
	return created;
}

/** Links a saved journal entry to the check-in it was written for. */
export function attachEntry(id, entryId) {
	checkins = checkins.map((c) => (c.id === id ? { ...c, entryId } : c));
	emit();
}

/** Unlinks a deleted journal entry so no check-in points at it. */
export function detachEntry(entryId) {
	if (!checkins.some((c) => c.entryId === entryId)) return;
	checkins = checkins.map((c) => (c.entryId === entryId ? { ...c, entryId: null } : c));
	emit();
}

export function get(id) {
	return checkins.find((c) => c.id === id);
}

/** All check-ins, oldest first. */
export function useCheckins() {
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** The most recent check-in today, or null. */
export function latestToday(list, now = new Date()) {
	for (let i = list.length - 1; i >= 0; i--) {
		if (isSameDay(list[i].createdAt, now)) return list[i];
	}
	return null;
}

export function onDay(list, date) {
	return list.filter((c) => isSameDay(c.createdAt, date));
}

/**
 * Monday–Sunday of the week containing `now`, each with its check-ins
 * (oldest first) and whether it's today or still to come.
 */
export function weekOf(list, now = new Date()) {
	const today = startOfDay(now);
	const monday = new Date(today);
	monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

	return Array.from({ length: 7 }, (_, i) => {
		const date = new Date(monday);
		date.setDate(monday.getDate() + i);
		return {
			date,
			letter: WEEKDAY_NAMES[date.getDay()][0],
			name: WEEKDAY_NAMES[date.getDay()],
			isToday: date.getTime() === today.getTime(),
			isFuture: date > today,
			checkins: onDay(list, date),
		};
	});
}

/** "Rough at 13:10, Mixed at 21:05" — for VoiceOver and the journal day view. */
export function describe(dayCheckins) {
	return dayCheckins.map((c) => `${c.mood} at ${timeLabel(c.createdAt)}`).join(', ');
}

const STEADY = ['Okay', 'Good'];

function mondayOf(date) {
	const d = startOfDay(date);
	d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
	return d;
}

/**
 * Counts for the Insights stat cards, from real check-ins.
 * A day is "steadier" when its last check-in was Okay or Good, and "rough"
 * when any check-in that day was Rough — a day can be both.
 */
function countDays(list) {
	const byDay = new Map();
	for (const c of list) {
		const key = dayKey(c.createdAt);
		byDay.set(key, [...(byDay.get(key) ?? []), c]);
	}
	let steadier = 0;
	let rough = 0;
	for (const day of byDay.values()) {
		if (STEADY.includes(day[day.length - 1].mood)) steadier++;
		if (day.some((c) => c.mood === 'Rough')) rough++;
	}
	return { steadier, rough, checkins: list.length };
}

/** `range` is 'week' (Monday to now) or 'bmt' (since BMT_START). */
export function summarize(list, range, now = new Date()) {
	if (range === 'bmt') return countDays(list.filter((c) => c.createdAt >= BMT_START));

	const monday = mondayOf(now);
	const lastMonday = new Date(monday);
	lastMonday.setDate(monday.getDate() - 7);

	return {
		...countDays(list.filter((c) => c.createdAt >= monday)),
		lastWeekRough: countDays(
			list.filter((c) => c.createdAt >= lastMonday && c.createdAt < monday),
		).rough,
	};
}
