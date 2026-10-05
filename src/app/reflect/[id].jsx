import DiscardSheet from '@/components/DiscardSheet';
import EventTag from '@/components/reflection/EventTag';
import AnswerBox from '@/components/ui/AnswerBox';
import Button from '@/components/ui/Button';
import ChoiceChip, { ChoiceGroup } from '@/components/ui/ChoiceChip';
import StepDots from '@/components/ui/StepDots';
import TextButton from '@/components/ui/TextButton';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { GUTTER } from '@/constants/layout';
import { MOODS } from '@/data/check-in-prompts';
import { add as addCheckin, attachEntry } from '@/data/checkin-store';
import { bmtDay } from '@/data/dates';
import { add as addJournalEntry, useJournal } from '@/data/journal-store';
import {
	EXPECTATIONS,
	MILESTONES,
	STOOD_OUT,
	easierRun,
	expectationOf,
	expectationQuote,
	getMilestone,
	inSentence,
	isOver,
	milestoneWeek,
	ordinal,
} from '@/data/milestones';
import { useAuth } from '@clerk/expo';
import { Redirect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

const NOTE_MAX = 200;

function Heading({ children }) {
	return (
		<Text accessibilityRole="header" className="w-full font-inter-bold text-large-title text-ink">
			{children}
		</Text>
	);
}

function Label({ children }) {
	return <Text className="w-full font-inter-semibold text-body text-ink">{children}</Text>;
}

/** The two-line insight panel (U2 result, U4 "third time running"). */
function Callout({ title, body }) {
	return (
		<View className="w-full gap-1 overflow-hidden rounded-md bg-calm-surface px-4 py-3">
			<Text className="w-full font-inter-semibold text-body text-calm-strong">{title}</Text>
			{body ? <Text className="w-full font-inter text-footnote text-ink">{body}</Text> : null}
		</View>
	);
}

/** "U4 Reflection saved" (node 187:46). */
function Saved({ milestone, answers, run, onTimeline, onDone }) {
	const padding = useScreenPadding({ top: 80, topGap: 36, bottom: 20, bottomGap: 8 });
	const expectation = expectationOf(answers.expectation);
	const easier = answers.expectation >= 4;
	const next = MILESTONES.find((m) => !isOver(m) && m.id !== milestone.id && m.day > milestone.day);

	const rows = [
		answers.mood ? ['How it went', answers.mood] : null,
		expectation ? ['vs expectation', expectation.short] : null,
	].filter(Boolean);

	return (
		<ScrollView
			className="flex-1 bg-canvas"
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{ flexGrow: 1, paddingHorizontal: GUTTER, ...padding }}
		>
			<EventTag tone="calm" label={`LOGGED · DAY ${bmtDay(new Date())}`} />
			<View className="h-5" />
			<Heading>{milestone.title}, done.</Heading>
			<View className="h-3" />
			<Text className="w-full font-inter text-body text-ink-muted">
				It&rsquo;s on your timeline now. You can read this back any time.
			</Text>

			{rows.length > 0 ? (
				<>
					<View className="h-7" />
					<View className="w-full gap-3 overflow-hidden rounded-lg border border-hairline bg-white px-4 py-4">
						{rows.map(([label, value]) => (
							<View key={label} className="w-full flex-row items-center justify-between gap-3">
								<Text className="font-inter-medium text-subhead text-ink-muted">{label}</Text>
								<Text className="font-inter-semibold text-subhead text-calm-strong">{value}</Text>
							</View>
						))}
					</View>
				</>
			) : null}

			{/* Only when earlier reflections back it up. */}
			{easier && run.length >= 2 ? (
				<>
					<View className="h-4" />
					<Callout
						title={`${ordinal(run.length + 1).replace(/^./, (c) => c.toUpperCase())} time running`}
						body={`${run.map((r) => getMilestone(r.milestoneId)?.title).join(', ')}, and now this — all easier than you expected going in.${
							next ? ` Worth remembering before ${inSentence(next.title)}.` : ''
						}`}
					/>
				</>
			) : null}

			<View className="min-h-8 flex-1" />

			<Button label="See it on your timeline" tone="secondary" onPress={onTimeline} />
			<View className="h-3" />
			<Button label="Done" onPress={onDone} />
		</ScrollView>
	);
}

/**
 * Milestone reflection — "U2 Reflect · step 1" (node 186:23), "U3 Reflect ·
 * step 2" (187:2) and "U4 Reflection saved" (187:46), opened from U1 on Home.
 *
 * Saving logs the mood as a check-in and the answers as a journal entry
 * (`kind: 'reflection'`), which Home's strip and the timeline then show.
 */
export default function ReflectScreen() {
	const padding = useScreenPadding({ bottom: 20, bottomGap: 8 });
	const router = useRouter();
	const navigation = useNavigation();
	const { isLoaded, isSignedIn } = useAuth();
	const { id } = useLocalSearchParams();
	const entries = useJournal();

	const [step, setStep] = useState(0);
	const [saved, setSaved] = useState(false);
	const [confirmingClose, setConfirmingClose] = useState(false);
	const [mood, setMood] = useState(null);
	const [expectation, setExpectation] = useState(null);
	const [tags, setTags] = useState([]);
	const [note, setNote] = useState('');

	const dirty = Boolean(mood || expectation || tags.length || note.trim());

	// Unsaved answers go through the same confirm as Close.
	useEffect(() => {
		navigation.setOptions({ gestureEnabled: !dirty || saved });
	}, [navigation, dirty, saved]);

	useEffect(() => {
		if (!dirty || saved) return undefined;
		const sub = BackHandler.addEventListener('hardwareBackPress', () => {
			setConfirmingClose(true);
			return true;
		});
		return () => sub.remove();
	}, [dirty, saved]);

	if (!isLoaded) return null;
	if (!isSignedIn) return <Redirect href="/login" />;

	const milestone = getMilestone(id);
	if (!milestone) return <Redirect href="/home" />;

	// Earlier reflections that also went easier than expected, for the
	// data-backed lines on U2 and U4.
	const run = easierRun(entries, milestone.id);
	const quote = expectationQuote(entries, milestone.id);
	const tag = `${milestone.title.toUpperCase()} · WEEK ${milestoneWeek(milestone)}`;

	function dismiss() {
		setConfirmingClose(false);
		if (router.canGoBack()) router.back();
		else router.replace('/home');
	}

	function close() {
		if (dirty) setConfirmingClose(true);
		else dismiss();
	}

	function save() {
		if (!dirty) return dismiss();
		const result = expectationOf(expectation);
		const stoodOut = [tags.join(', '), note.trim()].filter(Boolean).join('. ');
		const parts = [
			{ prompt: 'How did it go?', text: [mood, result?.result].filter(Boolean).join('. ') },
			{ prompt: 'What stood out?', text: stoodOut },
		].filter((part) => part.text);

		// TODO: replace the in-memory stores with the journal and check-in APIs.
		const entry = addJournalEntry({
			kind: 'reflection',
			milestoneId: milestone.id,
			mood,
			parts,
			answers: { mood, expectation, tags, note: note.trim() },
		});
		if (mood) attachEntry(addCheckin(mood).id, entry.id);
		setConfirmingClose(false);
		setSaved(true);
	}

	function toggleTag(tagLabel) {
		setTags((prev) =>
			prev.includes(tagLabel) ? prev.filter((t) => t !== tagLabel) : [...prev, tagLabel],
		);
	}

	if (saved) {
		return (
			<Saved
				milestone={milestone}
				answers={{ mood, expectation }}
				run={run}
				onTimeline={() => router.replace('/insights/timeline')}
				onDone={dismiss}
			/>
		);
	}

	const result = expectationOf(expectation);
	const easier = expectation >= 4;

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-canvas"
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<View className="flex-1" style={{ paddingHorizontal: GUTTER, ...padding }}>
				<View className="w-full flex-row items-center justify-between">
					{step === 0 ? (
						<TextButton label="Close" onPress={close} />
					) : (
						<TextButton
							label="Back"
							accessibilityLabel="Back to the previous question"
							onPress={() => setStep(0)}
						/>
					)}

					{/* Centred in the header, as in the daily check-in. */}
					<StepDots step={step} />

					<TextButton
						label="Skip"
						accessibilityLabel="Skip this question"
						onPress={step === 0 ? () => setStep(1) : save}
					/>
				</View>

				<ScrollView
					className="flex-1"
					keyboardShouldPersistTaps="handled"
					keyboardDismissMode="interactive"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1 }}
				>
					<View className="h-6" />
					<EventTag label={tag} />
					<View className="h-4" />

					{step === 0 ? (
						<>
							<Heading>How did it go?</Heading>
							<View className="h-5" />
							<ChoiceGroup>
								{MOODS.map((m) => (
									<ChoiceChip
										key={m}
										label={m}
										selected={mood === m}
										onPress={() => setMood(mood === m ? null : m)}
									/>
								))}
							</ChoiceGroup>

							<View className="h-8" />
							<Label>Compared to what you expected</Label>
							{quote ? (
								<>
									<View className="h-2" />
									<Text className="w-full font-inter text-footnote text-ink-faint">{quote}</Text>
								</>
							) : null}
							<View className="h-4" />
							<ChoiceGroup>
								{EXPECTATIONS.map((e) => (
									<ChoiceChip
										key={e.value}
										label={e.label}
										selected={expectation === e.value}
										onPress={() => setExpectation(expectation === e.value ? null : e.value)}
									/>
								))}
							</ChoiceGroup>

							{result ? (
								<>
									<View className="h-4" />
									<Callout
										title={result.result}
										body={
											easier && run.length >= 2
												? `That's the ${ordinal(run.length + 1)} time in a row.`
												: null
										}
									/>
								</>
							) : null}
						</>
					) : (
						<>
							<Heading>What stood out?</Heading>
							<View className="h-2" />
							<Text className="w-full font-inter text-callout text-ink-muted">
								Tap any that fit. You don&rsquo;t have to write anything.
							</Text>
							<View className="h-5" />
							<ChoiceGroup multiple>
								{STOOD_OUT.map((t) => (
									<ChoiceChip
										key={t}
										label={t}
										role="checkbox"
										selected={tags.includes(t)}
										onPress={() => toggleTag(t)}
									/>
								))}
							</ChoiceGroup>

							<View className="h-6" />
							<Label>Anything else?</Label>
							<View className="h-3" />
							<AnswerBox
								value={note}
								onChangeText={setNote}
								accessibilityLabel="Anything else about it?"
								placeholder="Optional. A sentence is plenty."
								maxLength={NOTE_MAX}
							/>
						</>
					)}

					<View className="min-h-6 flex-1" />
				</ScrollView>

				{step === 0 ? (
					<Button label="Next" onPress={() => setStep(1)} />
				) : (
					<Button label="Save reflection" disabled={!dirty} onPress={save} />
				)}
			</View>

			<DiscardSheet
				visible={confirmingClose}
				body="Your answers aren't saved yet."
				onSave={save}
				onDiscard={dismiss}
				onKeep={() => setConfirmingClose(false)}
			/>
		</KeyboardAvoidingView>
	);
}
