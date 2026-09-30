/**
 * PLACEHOLDER DATA — the parts of the S2 dashboard (Figma node 178:2) that no
 * real source produces yet. The greeting, recheck card and week strip now come
 * from Clerk and the check-in store; the stats row was removed after the
 * design review (it repeated the week strip and milestones).
 */
const home = {
	insight: {
		title: 'Your afternoon check-ins run lower than your evening ones.',
		body: 'Across 9 check-ins this week. Days often recover by lights out.',
	},

	/** `mood` is how that stretch went; null for milestones still ahead. */
	milestones: [
		{ name: 'SOC', week: 'Wk 3', mood: 'Mixed' },
		{ name: 'Live firing', week: 'Wk 4', mood: 'Good' },
		{ name: 'Field camp', week: 'Wk 5', mood: null },
		{ name: '16 km march', week: 'Wk 7', mood: null },
	],
};

export default home;
