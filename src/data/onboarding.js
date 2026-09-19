/**
 * Copy and options for the first-run onboarding flow, transcribed from Figma
 * frames I1–I8 (nodes 16:2, 16:12, 16:34, 17:2, 17:26, 17:48, 17:68).
 *
 * I4 "Understand" (16:58) was cut after the design review: it was the only
 * screen with nothing to do. Its one essential line now closes I3's footnote.
 * `progress` is re-spread over the remaining six barred screens.
 */

/**
 * I3 — "try it now" check-in. Single select. Same four words as the real
 * check-in on Home; the frame's "Up and down" / "Steady enough" were a second
 * vocabulary for the same thing.
 */
export { MOODS } from './check-in-prompts';

/**
 * I5 — coping preferences. Multi select.
 *
 * `toolId` is the tool (src/data/tools.js) the pick puts on I8 and the home
 * screen. The frame names "Sleep wind-down" and "60-second reset", which aren't
 * in the N1 library, so each pick maps to the nearest real tool.
 */
export const COPING = [
	{ id: 'sleep', label: 'Getting to sleep faster', toolId: 'worry' },
	{ id: 'calm', label: 'Calming down quickly', toolId: 'box' },
	{ id: 'write', label: 'Writing things out', toolId: 'good-things' },
	{ id: 'home', label: 'Staying connected to home', toolId: 'home' },
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

/**
 * I7 — reminder slot. Single select. `summary` is the line I8 shows once the
 * daily notification is actually scheduled; see REMINDER_PROBLEMS otherwise.
 */
export const REMINDERS = [
	{
		id: 'morning',
		label: 'After breakfast  ·  07:30',
		hour: 7,
		minute: 30,
		summary: 'Morning check-in set for 07:30.',
	},
	{
		id: 'evening',
		label: 'Before lights out  ·  22:00',
		hour: 22,
		minute: 0,
		summary: 'Evening check-in set for 22:00.',
	},
];

/** I8's line when a reminder was picked but couldn't be scheduled. */
export const REMINDER_PROBLEMS = {
	denied:
		"Reminders are off because notifications aren't allowed. You can turn them on in your phone's Settings.",
	unavailable: "Couldn't set the reminder on this device. You can still check in any time.",
};

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
		// Added after the design review: the AI summary on Insights needs saying
		// out loud before anyone turns it on. Needs legal/clinical review.
		tone: 'sand',
		title: 'AI summaries, only if you say yes',
		body: 'Off unless you turn them on. When on, your check-ins and journal entries are sent to an AI model (Claude) to write a short weekly summary.',
		note: 'Your unit never sees it. You can turn it off any time in Settings.',
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
		progress: 32,
		eyebrow: 'NOTICE',
		title: "Notice how you're doing",
		body: "One tap each evening. Try it now — how's today been?",
		// The second sentence is carried over from the cut I4 frame.
		footnote:
			"That's the whole check-in. Ten seconds, once a day. After a week or so, Steady shows you patterns. It describes them; it doesn't diagnose you.",
		cta: 'Continue',
	},
	{
		id: 'cope',
		node: '17:2',
		progress: 50,
		eyebrow: 'COPE',
		title: 'Build ways to cope',
		body: "Pick what you'd find useful. We'll put those on your home screen — you can change this anytime.",
		footnote: 'These are preferences, not an assessment.',
		cta: 'Continue',
	},
	{
		id: 'reach-out',
		node: '17:26',
		progress: 68,
		eyebrow: 'REACH OUT',
		title: 'Reaching out, on your terms',
		body: 'If a stretch looks heavy, what should Steady do?',
		footnote: 'Steady never contacts anyone on your behalf without asking you first.',
		cta: 'Continue',
	},
	{
		id: 'reminder',
		node: '17:48',
		progress: 85,
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
