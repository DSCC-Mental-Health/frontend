/**
 * Copy and options for the first-run onboarding flow, transcribed from Figma
 * frames I1–I8 (nodes 16:2, 16:12, 16:34, 16:58, 17:2, 17:26, 17:48, 17:68).
 *
 * `progress` is each frame's bar fill over its 319px track, which works out to
 * round percentages.
 */

/** I3 — "try it now" check-in. Single select. */
export const MOODS = ['Rough', 'Up and down', 'Steady enough', 'Good'];

/**
 * I5 — coping preferences. Multi select.
 *
 * `tool` is what the pick becomes on I8. The design only shows the mapping for
 * the first two ("Sleep wind-down" and "60-second reset"); the last two are
 * named here as a best guess and should be confirmed against the tools library.
 */
export const COPING = [
	{
		id: 'sleep',
		label: 'Getting to sleep faster',
		tool: 'Sleep wind-down',
	},
	{
		id: 'calm',
		label: 'Calming down quickly',
		tool: '60-second reset',
	},
	{
		id: 'write',
		label: 'Writing things out',
		// Not in the design — placeholder name.
		tool: 'Journal prompt',
	},
	{
		id: 'home',
		label: 'Staying connected to home',
		// Not in the design — placeholder name.
		tool: 'Staying in touch',
	},
];

/** I6 — escalation preference. Single select. */
export const REACH_OUT = [
	{
		id: 'ask',
		title: 'Ask me first',
		body: 'Steady shows you options — paraCounsellor chat, hotline, a buddy — and you decide. Nothing happens without you.',
	},
	{
		id: 'menu',
		title: 'Just keep it in the menu',
		body: 'No prompts. Support stays one tap away whenever you want it.',
	},
];

/** I7 — reminder slot. Single select. `summary` is the line I8 shows. */
export const REMINDERS = [
	{
		id: 'morning',
		label: 'After breakfast  ·  07:30',
		summary: 'Morning check-in set for 07:30.',
	},
	{
		id: 'evening',
		label: 'Before lights out  ·  22:00',
		summary: 'Evening check-in set for 22:00.',
	},
];

/** I2 — privacy panels. `tone` selects the panel fill. */
export const PRIVACY_PANELS = [
	{
		tone: 'sand',
		title: 'Collected once, at sign-up',
		// Reworded off Singpass: the app signs in with email and password now.
		body: "Your account confirms you're an NSF and stops anyone else signing in as you.",
		note: "That's all it's used for. It is never attached to anything you write.",
	},
	{
		tone: 'teal',
		title: 'Yours alone',
		lines: ['Daily mood check-ins', 'Sleep entries', 'Anything you journal'],
		note: 'Your identity and your entries are stored apart and never joined in any view a commander can open.',
	},
	{
		tone: 'white',
		title: 'What your unit sees',
		lines: [
			'Platoon-level counts only — for example, "4 of 32 reported poor sleep this week."',
			'No names. No way to work out who.',
		],
	},
];

/** I4 — example insight cards. */
export const EXAMPLE_INSIGHTS = [
	{
		title: 'Example insight',
		body: 'Your lower days this week all followed nights under 5 hours of sleep.',
	},
	{
		title: 'Example insight',
		body: "You've mentioned home in 4 of 6 journal entries. That's very common in week two.",
	},
];

/**
 * Per-step chrome. `progress` is null on I1, which has no bar.
 */
export const STEPS = [
	{
		id: 'welcome',
		node: '16:2',
		progress: null,
		title: 'Steady',
		cta: 'Show me how',
	},
	{
		id: 'privacy',
		node: '16:12',
		progress: 15,
		title: 'Who can see what',
		cta: 'Continue',
	},
	{
		id: 'notice',
		node: '16:34',
		progress: 35,
		eyebrow: 'STEP 1 OF 4  ·  NOTICE',
		title: "Notice how you're doing",
		body: "One tap each evening. Try it now — how's today been?",
		footnote: "That's the whole check-in. Ten seconds, once a day.",
		cta: 'Continue',
	},
	{
		id: 'understand',
		node: '16:58',
		progress: 50,
		eyebrow: 'STEP 2 OF 4  ·  UNDERSTAND',
		title: 'Understand what it means',
		body: 'After a week or so, Steady starts showing you patterns you might not notice yourself.',
		footnote: "Steady describes patterns. It doesn't diagnose you.",
		cta: 'Continue',
	},
	{
		id: 'cope',
		node: '17:2',
		progress: 65,
		eyebrow: 'STEP 3 OF 4  ·  COPE',
		title: 'Build ways to cope',
		body: "Pick what you'd find useful. We'll put those on your home screen — you can change this anytime.",
		footnote: 'These are preferences, not an assessment.',
		cta: 'Continue',
	},
	{
		id: 'reach-out',
		node: '17:26',
		progress: 80,
		eyebrow: 'STEP 4 OF 4  ·  REACH OUT',
		title: 'Reaching out, on your terms',
		body: 'If a stretch looks heavy, what should Steady do?',
		footnote: 'Steady never contacts anyone on your behalf without asking you first.',
		cta: 'Continue',
	},
	{
		id: 'reminder',
		node: '17:48',
		progress: 92,
		title: 'When should we check in?',
		body: 'One quiet notification a day. No streaks, no scores.',
		cta: 'Continue',
	},
	{
		id: 'ready',
		node: '17:68',
		progress: 100,
		title: "You're set up",
		body: "Here's what's waiting on your home screen, based on what you picked.",
		cta: 'Enter Steady',
	},
];

/** Always offered on I8, whatever was picked earlier. */
export const ALWAYS_ON_TOOL = {
	name: 'Talk to someone',
	detail: 'Anonymous. Always there.',
};
