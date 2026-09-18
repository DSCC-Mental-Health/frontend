import {
	ALWAYS_ON_TOOL,
	COPING,
	EXAMPLE_INSIGHTS,
	MOODS,
	PRIVACY_PANELS,
	REACH_OUT,
	REMINDERS,
	STEPS,
} from '@/data/onboarding';
import { Text, View } from 'react-native';
import Chrome from './Chrome';
import { InfoCard, OptionCard, OptionRow } from './Options';

const PANEL_BG = {
	sand: 'bg-avatar',
	teal: 'bg-insight',
	white: 'bg-white',
};

const PANEL_TITLE = {
	sand: 'text-ink',
	teal: 'text-insight-ink',
	white: 'text-ink',
};

/** I1 Welcome (16:2) — no progress bar, larger title, footnote under the CTA. */
export function Welcome({ step, onNext }) {
	return (
		<Chrome
			progress={step.progress}
			topSpace={80}
			contentSpace={14}
			title={step.title}
			titleClassName="font-inter-bold text-[34px] leading-[47.6px] text-ink"
			cta={step.cta}
			onPress={onNext}
			ctaFootnote="About a minute. Nothing goes to your unit."
		>
			<View className="gap-5.5">
				<Text className="w-full font-inter text-[16px] leading-[22.4px] text-ink-muted">
					The first weeks of BMT move fast. It&rsquo;s easy to miss the early signs of
					stress until they&rsquo;ve already built up.
				</Text>
				<Text className="w-full font-inter text-[16px] leading-[22.4px] text-ink-muted">
					Steady helps you notice them sooner.
				</Text>
			</View>
		</Chrome>
	);
}

/** I2 Privacy (16:12) — three tinted panels. */
export function Privacy({ step, onNext }) {
	return (
		<Chrome progress={step.progress} title={step.title} cta={step.cta} onPress={onNext}>
			<View className="w-full gap-3">
				{PRIVACY_PANELS.map((panel) => (
					<View
						key={panel.title}
						className={`w-full gap-2 overflow-hidden rounded-control px-4 py-3.75 ${PANEL_BG[panel.tone]}`}
					>
						<Text
							className={`w-full font-inter-semibold text-[14px] ${PANEL_TITLE[panel.tone]}`}
						>
							{panel.title}
						</Text>
						{panel.body ? (
							<Text className="w-full font-inter text-[14px] leading-[19.88px] text-ink-muted">
								{panel.body}
							</Text>
						) : null}
						{panel.lines?.map((line) => (
							<Text
								key={line}
								className="w-full font-inter text-[14px] leading-[19.88px] text-ink-muted"
							>
								{line}
							</Text>
						))}
						{panel.note ? (
							<Text className="w-full font-inter-medium text-[12px] leading-[17.4px] text-ink">
								{panel.note}
							</Text>
						) : null}
					</View>
				))}
			</View>
		</Chrome>
	);
}

/** I3 Notice (16:34) — single-select mood. */
export function Notice({ step, answers, setAnswer, onNext }) {
	return (
		<Chrome
			progress={step.progress}
			eyebrow={step.eyebrow}
			title={step.title}
			body={step.body}
			footnote={step.footnote}
			cta={step.cta}
			onPress={onNext}
		>
			<View className="w-full gap-2.5">
				{MOODS.map((mood) => (
					<OptionRow
						key={mood}
						label={mood}
						selected={answers.mood === mood}
						onPress={() => setAnswer('mood', answers.mood === mood ? null : mood)}
					/>
				))}
			</View>
		</Chrome>
	);
}

/** I4 Understand (16:58) — example insight cards, nothing to pick. */
export function Understand({ step, onNext }) {
	return (
		<Chrome
			progress={step.progress}
			eyebrow={step.eyebrow}
			title={step.title}
			body={step.body}
			footnote={step.footnote}
			cta={step.cta}
			onPress={onNext}
		>
			<View className="w-full gap-3">
				{EXAMPLE_INSIGHTS.map((insight, i) => (
					<InfoCard key={i} title={insight.title} body={insight.body} />
				))}
			</View>
		</Chrome>
	);
}

/** I5 Cope (17:2) — multi-select; drives the I8 summary. */
export function Cope({ step, answers, setAnswer, onNext }) {
	function toggle(id) {
		const next = answers.coping.includes(id)
			? answers.coping.filter((c) => c !== id)
			: [...answers.coping, id];
		setAnswer('coping', next);
	}

	return (
		<Chrome
			progress={step.progress}
			eyebrow={step.eyebrow}
			title={step.title}
			body={step.body}
			footnote={step.footnote}
			cta={step.cta}
			onPress={onNext}
		>
			<View className="w-full gap-2.5">
				{COPING.map((option) => (
					<OptionRow
						key={option.id}
						label={option.label}
						selected={answers.coping.includes(option.id)}
						onPress={() => toggle(option.id)}
					/>
				))}
			</View>
		</Chrome>
	);
}

/** I6 Reach Out (17:26) — single-select card. */
export function ReachOut({ step, answers, setAnswer, onNext }) {
	return (
		<Chrome
			progress={step.progress}
			eyebrow={step.eyebrow}
			title={step.title}
			body={step.body}
			footnote={step.footnote}
			cta={step.cta}
			onPress={onNext}
		>
			<View className="w-full gap-3">
				{REACH_OUT.map((option) => (
					<OptionCard
						key={option.id}
						title={option.title}
						body={option.body}
						selected={answers.reachOut === option.id}
						onPress={() => setAnswer('reachOut', option.id)}
					/>
				))}
			</View>
		</Chrome>
	);
}

/** I7 Reminder (17:48) — single-select time; drives the I8 closing line. */
export function Reminder({ step, answers, setAnswer, onNext }) {
	return (
		<Chrome
			progress={step.progress}
			title={step.title}
			body={step.body}
			cta={step.cta}
			onPress={onNext}
		>
			<View className="w-full gap-2.5">
				{REMINDERS.map((option) => (
					<OptionRow
						key={option.id}
						label={option.label}
						selected={answers.reminder === option.id}
						onPress={() => setAnswer('reminder', option.id)}
					/>
				))}
			</View>
		</Chrome>
	);
}

/** I8 Ready (17:68) — summarises the picks; amber CTA into the dashboard. */
export function Ready({ step, answers, onNext, busy }) {
	const picked = COPING.filter((c) => answers.coping.includes(c.id));
	const reminder = REMINDERS.find((r) => r.id === answers.reminder);

	return (
		<Chrome
			progress={step.progress}
			title={step.title}
			titleClassName="font-inter-bold text-[28px] leading-[39.2px] text-ink"
			body={step.body}
			footnote={reminder?.summary}
			cta={busy ? 'Setting up…' : step.cta}
			ctaTone="warn"
			ctaDisabled={busy}
			onPress={onNext}
		>
			<View className="w-full gap-2.5">
				{picked.map((option) => (
					<InfoCard
						key={option.id}
						title={option.tool}
						body={`From "${option.label.toLowerCase()}"`}
					/>
				))}
				<InfoCard title={ALWAYS_ON_TOOL.name} body={ALWAYS_ON_TOOL.detail} />
			</View>
		</Chrome>
	);
}

/** Ordered to match STEPS in src/data/onboarding.js. */
export const STEP_COMPONENTS = [
	Welcome,
	Privacy,
	Notice,
	Understand,
	Cope,
	ReachOut,
	Reminder,
	Ready,
];

export { STEPS };
