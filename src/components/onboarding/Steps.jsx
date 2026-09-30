import PrivacyPanels from '@/components/PrivacyPanels';
import {
	ALWAYS_ON_TOOL,
	COPING,
	MOODS,
	REACH_OUT,
	REMINDER_PROBLEMS,
	REMINDERS,
} from '@/data/onboarding';
import { findTool } from '@/data/tools';
import { Text, View } from 'react-native';
import Chrome from './Chrome';
import { InfoCard, OptionCard, OptionGroup, OptionRow } from './Options';

/**
 * One component per Figma frame. Chrome draws the shared furniture and reads
 * the wording from `step`, so each one below is only what makes it different.
 */

/** I1 Welcome (16:2) — no progress bar or back link, larger title, footnote under the CTA. */
export function Welcome({ step, onNext }) {
	return (
		<Chrome
			step={step}
			size="large"
			rings={112}
			onNext={onNext}
			ctaFootnote="About a minute. Nothing goes to your unit."
		>
			<View className="gap-6">
				{step.paragraphs.map((paragraph) => (
					<Text
						key={paragraph}
						className="w-full font-inter text-body-lg text-ink-muted"
					>
						{paragraph}
					</Text>
				))}
			</View>
		</Chrome>
	);
}

/** I2 Privacy (16:12) — three tinted panels. */
export function Privacy({ step, onNext, onBack }) {
	return (
		<Chrome step={step} onBack={onBack} onNext={onNext}>
			<PrivacyPanels />
		</Chrome>
	);
}

/** I3 Notice (16:34) — single-select mood. */
export function Notice({ step, answers, setAnswer, onNext, onBack }) {
	return (
		<Chrome step={step} onBack={onBack} onNext={onNext}>
			<OptionGroup>
				{MOODS.map((mood) => (
					<OptionRow
						key={mood}
						label={mood}
						selected={answers.mood === mood}
						onPress={() => setAnswer('mood', answers.mood === mood ? null : mood)}
					/>
				))}
			</OptionGroup>
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
		<Chrome step={step} onBack={onBack} onNext={onNext}>
			<OptionGroup multiple>
				{COPING.map((option) => (
					<OptionRow
						key={option.id}
						label={option.label}
						role="checkbox"
						selected={answers.coping.includes(option.id)}
						onPress={() => toggle(option.id)}
					/>
				))}
			</OptionGroup>
		</Chrome>
	);
}

/** I6 Reach Out (17:26) — single-select card. */
export function ReachOut({ step, answers, setAnswer, onNext, onBack }) {
	return (
		<Chrome step={step} onBack={onBack} onNext={onNext}>
			<OptionGroup gap="gap-3">
				{REACH_OUT.map((option) => (
					<OptionCard
						key={option.id}
						title={option.title}
						body={option.body}
						selected={answers.reachOut === option.id}
						onPress={() => setAnswer('reachOut', option.id)}
					/>
				))}
			</OptionGroup>
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
			step={step}
			onBack={onBack}
			onNext={onNext}
			busy={busy}
			busyLabel="Setting reminder…"
		>
			<OptionGroup>
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
			</OptionGroup>
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
				: (REMINDER_PROBLEMS[answers.reminderStatus] ?? REMINDER_PROBLEMS.unavailable);
	}

	return (
		<Chrome
			step={step}
			rings={64}
			tone="warn"
			onBack={busy ? undefined : onBack}
			onNext={onNext}
			busy={busy}
			busyLabel="Setting up…"
			footnote={reminderLine}
			error={error}
		>
			<View className="w-full gap-3">
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
