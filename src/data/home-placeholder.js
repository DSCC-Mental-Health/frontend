/**
 * PLACEHOLDER DATA — none of this is real.
 *
 * Every value is transcribed from the "S2 Home dashboard (multi check-in)" frame
 * in Figma (node 178:2) so the screen can be built and reviewed before any API
 * exists. When the backend lands, replace this module wholesale; the dashboard
 * reads nothing else.
 */

/** Mood keys, ordered worst to best — the order the chips are drawn in. */
export const MOODS = ['Rough', 'Mixed', 'Okay', 'Good'];

/**
 * One entry per day of the week.
 *
 * `segments` holds that day's check-ins, oldest first. The week strip stacks
 * them into a single pill: one segment renders as a flat 22px dot, more than one
 * renders as a taller column of equal slices (2 -> 31px, 3 -> 40px in the frame).
 *
 * `state` is 'logged' | 'today' | 'future'.
 */
export const WEEK = [
	{ label: 'M', state: 'logged', segments: ['calm'] },
	{ label: 'T', state: 'logged', segments: ['warn', 'accent'] },
	{ label: 'W', state: 'logged', segments: ['accent', 'accent', 'warn'] },
	{ label: 'T', state: 'logged', segments: ['calm'] },
	{ label: 'F', state: 'logged', segments: ['warn', 'calm'] },
	{ label: 'S', state: 'today', segments: [] },
	{ label: 'S', state: 'future', segments: [] },
];

const home = {
	greeting: 'Evening, John Doe',
	dayLine: 'Day 23 · Week 4 of 9',
	weekHint: 'Tap any day to see its entries.',

	recheck: {
		title: 'Check in again?',
		subtitle: 'You logged "mixed" at 13:40. Things can shift.',
	},

	stats: [
		{ value: '5', unit: '/7', tone: 'calm', lines: ['days logged', 'this week'] },
		{ value: '9', unit: null, tone: 'ink', lines: ['check-ins', 'this week'] },
		{ value: '4', unit: 'days', tone: 'warn', lines: ['until', 'field camp'] },
	],

	insight: {
		title: 'Your afternoon check-ins run lower than your evening ones.',
		body: 'Across 9 check-ins this week. Days often recover by lights out.',
	},

	milestones: [
		{ name: 'SOC', week: 'Wk 3', tone: 'warn' },
		{ name: 'Live firing', week: 'Wk 4', tone: 'calm' },
		{ name: 'Field camp', week: 'Wk 5', tone: 'upcoming' },
		{ name: '16 km march', week: 'Wk 7', tone: 'upcoming' },
	],

	tools: [
		{ name: '60-second reset', duration: '1 min', tone: 'accent' },
		{ name: 'Sleep wind-down', duration: '6 min', tone: 'calm' },
	],
};

export default home;
