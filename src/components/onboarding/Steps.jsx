import PrivacyPanels from '@/components/PrivacyPanels';
import {
	ALWAYS_ON_TOOL,
	COPING,
	MOODS,
	REACH_OUT,
	REMINDER_PROBLEMS,
	REMINDERS,
	STEPS,
} from '@/data/onboarding';
import { findTool } from '@/data/tools';
import { Text, View } from 'react-native';
import Chrome from './Chrome';
import { InfoCard, OptionCard, OptionRow } from './Options';

/** I1 Welcome (16:2) — no progress bar or back link, larger title, footnote under the CTA. */
export function Welcome({ step, onNext }) {
	return (
		<Chrome
			progress={step.progress}
			topSpace={24}
			rings={112}
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
export function Privacy({ step, onNext, onBack }) {
	return (
		<Chrome
			progress={step.progress}
			onBack={onBack}
			title={step.title}
			cta={step.cta}
			onPress={onNext}
		>
			<PrivacyPanels />
		</Chrome>
	);
}

/** I3 Notice (16:34) — single-select mood. */
export function Notice({ step, answers, setAnswer, onNext, onBack }) {
	return (
		<Chrome
			progress={step.progress}
			onBack={onBack}
			eyebrow={step.eyebrow}
			title={step.title}
			body={step.body}
			footnote={step.footnote}
			cta={step.cta}
			onPress={onNext}
		>
			<View accessibilityRole="radiogroup" className="w-full gap-2.5">
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

/** I5 Cope (17:2) — multi-select; drives the I8 summary and the home screen tools. */
export function Cope({ step, answers, setAnswer, onNext, onBack }) {
	function toggle(id) {
		const next = answers.coping.includes(id)
			? answers.coping.filter((c) => c !== id)
			: [...answers.coping, id];
		setAnswer('coping', next);
	}

	return (
		<Chrome
			progress={step.progress}
			onBack={onBack}
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
						role="checkbox"
						selected={answers.coping.includes(option.id)}
						onPress={() => toggle(option.id)}
					/>
				))}
			</View>
		</Chrome>
	);
}

/** I6 Reach Out (17:26) — single-select card. */
export function ReachOut({ step, answers, setAnswer, onNext, onBack }) {
	return (
		<Chrome
			progress={step.progress}
			onBack={onBack}
			eyebrow={step.eyebrow}
			title={step.title}
			body={step.body}
			footnote={step.footnote}
			cta={step.cta}
			onPress={onNext}
		>
			<View accessibilityRole="radiogroup" className="w-full gap-3">
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

/**
 * I7 Reminder (17:48) — single-select time. Continue asks for notification
 * permission and schedules it (see onboarding.jsx), so `busy` covers that wait.
 */
export function Reminder({ step, answers, setAnswer, onNext, onBack, busy }) {
	return (
		<Chrome
			progress={step.progress}
			onBack={onBack}
			title={step.title}
			body={step.body}
			cta={busy ? 'Setting reminder…' : step.cta}
			ctaDisabled={busy}
			onPress={onNext}
		>
			<View accessibilityRole="radiogroup" className="w-full gap-2.5">
				{REMINDERS.map((option) => (
					<OptionRow
						key={option.id}
						label={option.label}
						selected={answers.reminder === option.id}
						onPress={() =>
							setAnswer('reminder', answers.reminder === option.id ? null : option.id)
						}
					/>
				))}
			</View>
		</Chrome>
	);
}

/** I8 Ready (17:68) — summarises the picks; amber CTA into the dashboard. */
export function Ready({ step, answers, onNext, onBack, busy, error }) {
	const picked = COPING.filter((c) => answers.coping.includes(c.id));
	const reminder = REMINDERS.find((r) => r.id === answers.reminder);

	// Only claim the reminder is set if it actually was.
	let reminderLine = null;
	if (reminder) {
		reminderLine =
			answers.reminderStatus === 'scheduled'
				? reminder.summary
				: REMINDER_PROBLEMS[answers.reminderStatus] ?? REMINDER_PROBLEMS.unavailable;
	}

	return (
		<Chrome
			progress={step.progress}
			onBack={busy ? undefined : onBack}
			rings={64}
			title={step.title}
			titleClassName="font-inter-bold text-[28px] leading-[39.2px] text-ink"
			body={step.body}
			footnote={reminderLine}
			cta={busy ? 'Setting up…' : step.cta}
			ctaTone="warn"
			ctaDisabled={busy}
			ctaError={error}
			onPress={onNext}
		>
			<View className="w-full gap-2.5">
				{picked.map((option) => (
					<InfoCard
						key={option.id}
						title={findTool(option.toolId)?.name}
						body={`From "${option.label.toLowerCase()}"`}
					/>
				))}
				<InfoCard title={ALWAYS_ON_TOOL.name} body={ALWAYS_ON_TOOL.detail} />
			</View>
		</Chrome>
	);
}

/** Ordered to match STEPS in src/data/onboarding.js. */
export const STEP_COMPONENTS = [Welcome, Privacy, Notice, Cope, ReachOut, Reminder, Ready];

export { STEPS };
