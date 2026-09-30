export const WORRY_PROMPT =
	"What's on your mind for tomorrow? For each worry, write one next step.";
export const GOOD_THINGS_PROMPT =
	'What are three things that went okay today, and why did they?';
export const HOME_PROMPT = "What's one thing about today I'd tell someone at home?";

export const TOOL_SECTIONS = [
	{
		title: 'Wound up right now',
		hint: 'Under three minutes. Works standing, in boots, without sound.',
		tools: [
			{
				id: 'box',
				name: 'Box breathing',
				duration: '3 min',
				icon: 'wind',
				body: 'In for four, hold four, out four, hold four. The one instructors teach.',
				href: '/breathe?pattern=box',
			},
			{
				id: 'exhale',
				name: 'Longer exhale breathing',
				duration: '2 min',
				icon: 'lungs',
				body: 'In for four, out for six. Making the out-breath longer is what actually settles the body.',
				href: '/breathe?pattern=exhale',
			},
			{
				id: 'grounding',
				name: '5-4-3-2-1 grounding',
				// Untimed ("Go at your own pace"), so only an estimate.
				duration: 'About 3 min',
				icon: 'hand.raised',
				body: 'Name five things you can see, four you can feel, three you can hear. Pulls you out of your head and back into the room.',
				href: '/grounding',
			},
		],
	},
	{
		title: "Can't get to sleep",
		hint: 'Do this before lights out, not at 2am.',
		tools: [
			{
				id: 'worry',
				name: 'Worry list',
				duration: '6 min',
				icon: 'list.bullet',
				body: "Write down tomorrow's worries and one next step for each, so they stop circling once you're lying down.",
				href: { pathname: '/write', params: { prompt: WORRY_PROMPT } },
			},
		],
	},
	{
		title: 'End of a hard day',
		tools: [
			{
				id: 'good-things',
				name: 'Three good things',
				duration: '4 min',
				icon: 'sun.max',
				body: 'Write down three things that went okay today, and why they did. Works best on the days it feels pointless.',
				href: { pathname: '/write', params: { prompt: GOOD_THINGS_PROMPT } },
			},
		],
	},
];


const MESSAGE_HOME = {
	id: 'home',
	name: 'Message home',
	duration: 'Free write',
	icon: 'house',
	body: "Write down one thing about today you'd tell someone at home.",
	href: { pathname: '/write', params: { prompt: HOME_PROMPT } },
};

const ALL_TOOLS = [...TOOL_SECTIONS.flatMap((section) => section.tools), MESSAGE_HOME];

export function findTool(id) {
	return ALL_TOOLS.find((tool) => tool.id === id);
}

export const BREATHING = {
	box: {
		name: 'Box breathing',
		cycles: 11, // 16s a cycle, ~3 min
		phases: [
			{ label: 'Breathe in', seconds: 4, scale: 1, guide: 'In through your nose. Let your shoulders drop.' },
			{ label: 'Hold', seconds: 4, scale: 1, guide: "Hold it gently. Don't clamp your throat." },
			{ label: 'Breathe out', seconds: 4, scale: 0.72, guide: 'Out slowly through your mouth.' },
			{ label: 'Hold', seconds: 4, scale: 0.72, guide: 'Stay empty for a moment. Keep your jaw loose.' },
		],
	},
	exhale: {
		name: 'Longer exhale breathing',
		cycles: 12, // 10s a cycle, 2 min
		phases: [
			{ label: 'Breathe in', seconds: 4, scale: 1, guide: 'In through your nose. Let your shoulders drop.' },
			{ label: 'Breathe out', seconds: 6, scale: 0.72, guide: 'Out slowly, longer than the in-breath.' },
		],
	},
};

export const GROUNDING_STEPS = [
	{
		count: 5,
		title: 'things you can see',
		body: 'Your locker. A light. Someone’s boots. The fan turning. Name them in your head, one at a time.',
	},
	{
		count: 4,
		title: 'things you can feel',
		body: 'Your boots. The bunk frame. Fabric on your arms. Air on your face. Name them in your head, one at a time.',
	},
	{
		count: 3,
		title: 'things you can hear',
		body: 'The fan. Voices down the corridor. Your own breathing. Name them in your head, one at a time.',
	},
	{
		count: 2,
		title: 'things you can smell',
		body: 'Soap, laundry, the air outside. If nothing comes, notice the air going in and name that.',
	},
	{
		count: 1,
		title: 'thing you can taste',
		body: 'Toothpaste, water, the last thing you ate. Or just notice the inside of your mouth.',
	},
];
