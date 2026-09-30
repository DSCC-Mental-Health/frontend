export const MOODS = ['Rough', 'Mixed', 'Okay', 'Good'];

export const PROMPTS = {
	Rough: [
		'What was the hardest part of today — the training itself, or something else?',
		'Is this a one-off bad day, or has it been building up?',
	],
	Mixed: [
		'What was one thing today that went better than you expected?',
		'If tomorrow could go slightly differently, what would change?',
	],
	Okay: [
		'Anything from today worth remembering when a harder week comes?',
		'Who or what made today more manageable?',
	],
	Good: [
		"What clicked today that hadn't before?",
		"Is there someone in your section you'd want to tell about this?",
	],
};

export const MOOD_CHIP_BG = {
	Rough: 'bg-accent',
	Mixed: 'bg-warn',
	Okay: 'bg-calm',
	Good: 'bg-calm',
};

export const MOOD_CHIP_TEXT = {
	Rough: 'text-white',
	Mixed: 'text-ink',
	Okay: 'text-white',
	Good: 'text-white',
};

export const MAX_CHARS = 300;

/**
 * Tool ids offered on L4 (nodes 23:16, 23:18). The frame names "60-second reset" and
 * "Sleep wind-down", which don't exist in the N1 library, so these are the
 * nearest real tools: one for calming down, one for sleep.
 */
export const FOLLOW_ON_TOOLS = ['box', 'worry'];
