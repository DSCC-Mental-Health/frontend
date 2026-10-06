import { useSyncExternalStore } from 'react';
import { BMT_START, BMT_WEEKS, DAY_MS } from './dates';

/**
 * The recruit's link to their platoon (Q4–Q6). It links them to platoon
 * totals only: per Q0 (node 315:2), recruits are never Clerk organisation
 * members, so nothing about it is stored on the Clerk user.
 *
 * TODO: replace with the Steady API. `POST /join` checks the code (active,
 * not expired, matches the cohort), writes the platoon_links row, and
 * unlinks automatically at POP. Until then these sample codes stand in and
 * the link is kept in memory.
 */
const CODES = {
	BRAVOP37K2Q: { company: 'Bravo Company', platoon: 3, cohort: '10/26' },
	ALPHAP14M8T: { company: 'Alpha Company', platoon: 1, cohort: '10/26' },
};

/** The three boxes on Q4: company, platoon, and the code itself. */
export const CODE_PARTS = [
	{ label: 'Company', maxLength: 6 },
	{ label: 'Platoon', maxLength: 3 },
	{ label: 'Code', maxLength: 4 },
];

/** "bravo - p3 - 7k2q" → "BRAVOP37K2Q". */
function normalise(code) {
	return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Splits a pasted "BRAVO-P3-7K2Q" into its three parts, or null. */
export function splitCode(text) {
	const parts = text.toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
	return parts.length === CODE_PARTS.length ? parts : null;
}

export function findPlatoon(code) {
	return CODES[normalise(code)] ?? null;
}

/** "Bravo Company · Platoon 3" */
export function platoonName(p) {
	return `${p.company} · Platoon ${p.platoon}`;
}

/** Passing out parade, when the link ends. */
export const POP_DATE = new Date(BMT_START.getTime() + BMT_WEEKS * 7 * DAY_MS);

let link = null;
const listeners = new Set();

function emit() {
	for (const listener of listeners) listener();
}

function subscribe(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function join(code) {
	const platoon = findPlatoon(code);
	if (!platoon) return null;
	link = { ...platoon, linkedAt: new Date() };
	emit();
	return link;
}

/** Stops counting toward platoon totals. Their own entries aren't touched. */
export function leave() {
	link = null;
	emit();
}

export function usePlatoon() {
	return useSyncExternalStore(subscribe, () => link);
}
