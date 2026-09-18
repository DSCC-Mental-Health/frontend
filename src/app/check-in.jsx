import {
	FOLLOW_ON_TOOLS,
	MAX_CHARS,
	MOOD_CHIP_BG,
	MOOD_CHIP_TEXT,
	PROMPTS,
} from '@/data/check-in-prompts';
import { add as addJournalEntry } from '@/data/journal-store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PLACEHOLDER = '#a39990';

/** Step dots (node 22:6) — 18x6 accent for the active step, 6x6 hairline otherwise. */
function StepDots({ step }) {
	return (
		<View className="flex-row items-center gap-1.5">
			{[0, 1].map((i) =>
				i === step ? (
					<View key={i} className="h-1.5 w-4.5 rounded-progress bg-accent" />
				) : (
					<View key={i} className="size-1.5 rounded-progress bg-hairline" />
				),
			)}
		</View>
	);
}

/** The "A QUESTION FOR YOU" card (node 22:16). */
function QuestionCard({ question }) {
	return (
		<View className="w-full gap-2.5 overflow-hidden rounded-prompt border border-hairline bg-white px-4.5 py-4">
			<Text className="font-inter-semibold text-[10px] tracking-[0.8px] text-ink-faint">
				A QUESTION FOR YOU
			</Text>
			<Text className="w-full font-inter-semibold text-[19px] leading-[25.65px] text-ink">
				{question}
			</Text>
		</View>
	);
}

/** Secondary button shared by "Not now" and "That's enough for today". */
function GhostButton({ label, onPress }) {
	return (
		<Pressable
			accessibilityRole="button"
			onPress={onPress}
			className="w-full items-center justify-center overflow-hidden rounded-control border border-hairline bg-white py-4 active:opacity-80"
		>
			<Text className="font-inter-semibold text-[16px] text-ink">{label}</Text>
		</Pressable>
	);
}

/** L4 Saved (node 23:2). */
function Saved({ onDone }) {
	const insets = useSafeAreaInsets();

	return (
		<View
			className="flex-1 bg-aura-outer px-6"
			style={{
				paddingTop: Math.max(80, insets.top + 36),
				paddingBottom: Math.max(20, insets.bottom + 8),
			}}
		>
			{/* The frame draws an empty teal disc here (node 23:4). */}
			<View className="size-14 rounded-full bg-calm" />

			<View className="h-6" />

			<Text className="w-full font-inter-bold text-[28px] leading-[39.2px] text-ink">
				Saved.
			</Text>

			<View className="h-2.5" />

			<Text className="w-full font-inter text-[15px] leading-[21px] text-ink-muted">
				That&rsquo;s day 23 logged. Writing it down is often the part that helps
				most.
			</Text>

			<View className="h-6.5" />

			<View className="w-full gap-2 overflow-hidden rounded-control bg-insight px-4.5 py-4">
				<Text className="w-full font-inter-semibold text-[13px] leading-[18.2px] text-calm">
					Not going anywhere
				</Text>
				<Text className="w-full font-inter text-[14px] leading-[19.6px] text-ink">
					This entry is stored privately. Your commanders and section mates cannot
					see it.
				</Text>
			</View>

			<View className="h-3.5" />

			<View className="w-full gap-2.5 overflow-hidden rounded-control border border-hairline bg-white px-4.5 py-4">
				<Text className="w-full font-inter-semibold text-[14px] leading-[19.6px] text-ink">
					Feeling like doing one more thing?
				</Text>
				{FOLLOW_ON_TOOLS.map((tool) => (
					// TODO: no frames for the tool players yet (N2/N3).
					<GhostButton key={tool} label={tool} onPress={() => {}} />
				))}
			</View>

			<View className="flex-1" />

			<Pressable
				accessibilityRole="button"
				onPress={onDone}
				className="w-full items-center justify-center overflow-hidden rounded-control bg-warn py-4 active:opacity-85"
			>
				<Text className="font-inter-semibold text-[16px] text-ink">
					Back to home
				</Text>
			</Pressable>
		</View>
	);
}

/**
 * Check-in journalling flow — L1/L2 (node 22:2, 22:33), L3 (22:115) and L4 (23:2).
 *
 * Saving adds the answers to the in-memory journal store (see journal-store.js);
 * closing without saving discards them. L1 and L2 are one screen in two states — entering text hides the mood chip and
 * intro line and collapses the buttons to a single Continue.
 */
export default function CheckInScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { mood: moodParam } = useLocalSearchParams();

	const mood = PROMPTS[moodParam] ? moodParam : 'Mixed';
	const bank = PROMPTS[mood];

	const [step, setStep] = useState(0);
	const [saved, setSaved] = useState(false);
	const [answers, setAnswers] = useState(['', '']);
	// "Ask me something else" cycles within the mood's pair.
	const [promptIndex, setPromptIndex] = useState([0, 1]);

	const text = answers[step];
	const hasText = text.trim().length > 0;
	const wroteAnything = answers.some((a) => a.trim().length > 0);

	function setText(value) {
		setAnswers((prev) => prev.map((a, i) => (i === step ? value : a)));
	}

	function dismiss() {
		if (router.canGoBack()) router.back();
		else router.replace('/home');
	}

	function finish() {
		// Each answered step becomes one part of the journal entry, paired with the
		// prompt that was showing. Unanswered steps are dropped.
		const parts = answers
			.map((text, i) => ({ prompt: bank[promptIndex[i]], text: text.trim() }))
			.filter((part) => part.text.length > 0);

		// TODO: replace the in-memory journal store with the journal API.
		if (parts.length > 0) addJournalEntry({ kind: 'prompted', mood, parts });
		setSaved(true);
	}

	function advance() {
		if (step === 0) setStep(1);
		else if (wroteAnything) finish();
		else dismiss();
	}

	function cyclePrompt() {
		setPromptIndex((prev) =>
			prev.map((p, i) => (i === step ? (p + 1) % bank.length : p)),
		);
	}

	if (saved) return <Saved onDone={dismiss} />;

	const isFollowUp = step === 1;

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-aura-outer"
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<View
				className="flex-1 px-6"
				style={{
					paddingTop: Math.max(56, insets.top + 12),
					paddingBottom: Math.max(20, insets.bottom + 8),
				}}
			>
				<View className="w-full flex-row items-center justify-between">
					<Pressable
						accessibilityRole="button"
						onPress={dismiss}
						hitSlop={10}
						className="active:opacity-60"
					>
						<Text className="font-inter-medium text-[14px] text-ink-muted">
							Close
						</Text>
					</Pressable>

					<StepDots step={step} />

					<Pressable
						accessibilityRole="button"
						onPress={advance}
						hitSlop={10}
						className="active:opacity-60"
					>
						<Text className="font-inter-medium text-[14px] text-ink-muted">
							Skip
						</Text>
					</Pressable>
				</View>

				<ScrollView
					className="flex-1"
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1 }}
				>
					{/* L1 only: the mood chip and intro make way once they start typing (L2). */}
					{!isFollowUp && !hasText ? (
						<>
							<View className="h-7" />
							<View
								className={`self-start overflow-hidden rounded-tag px-3.5 py-2 ${MOOD_CHIP_BG[mood]}`}
							>
								<Text
									className={`font-inter-semibold text-[13px] ${MOOD_CHIP_TEXT[mood]}`}
								>
									Today: {mood}
								</Text>
							</View>
							<View className="h-5" />
							<Text className="w-full font-inter text-[15px] leading-[21px] text-ink-muted">
								Thanks for logging that. Want to say a bit more?
							</Text>
							<View className="h-4.5" />
						</>
					) : (
						<View className="h-6" />
					)}

					{isFollowUp ? (
						<>
							<View className="w-full gap-1.5 overflow-hidden rounded-field bg-avatar px-3.5 py-3">
								<Text className="font-inter-semibold text-[10px] tracking-[0.8px] text-ink-faint">
									YOU WROTE
								</Text>
								<Text className="w-full font-inter text-[13px] leading-[18.2px] text-ink-muted">
									{answers[0].trim() || '—'}
								</Text>
							</View>
							<View className="h-5" />
						</>
					) : null}

					<QuestionCard question={bank[promptIndex[step]]} />

					<View className="h-3" />

					<Pressable
						accessibilityRole="button"
						onPress={cyclePrompt}
						className="self-start overflow-hidden rounded-tag border border-hairline bg-white px-3.5 py-2.5 active:opacity-80"
					>
						<Text className="font-inter-medium text-[13px] text-ink">
							Ask me something else
						</Text>
					</Pressable>

					<View className="h-4" />

					<View
						className={`w-full gap-2 overflow-hidden rounded-control bg-white px-4 py-3.5 ${
							hasText ? 'border-1.5 border-accent' : 'border border-hairline'
						}`}
					>
						<TextInput
							value={text}
							onChangeText={setText}
							placeholder={
								isFollowUp
									? 'Type here, or skip this one.'
									: 'Type here. A sentence is enough.'
							}
							placeholderTextColor={PLACEHOLDER}
							multiline
							maxLength={MAX_CHARS}
							textAlignVertical="top"
							className="w-full p-0 font-inter text-[15px] leading-[21.75px] text-ink"
						/>
						{hasText ? (
							<Text className="w-full text-right font-inter text-[11px] text-ink-faint">
								{MAX_CHARS - text.length} characters left
							</Text>
						) : null}
					</View>

					<View className="flex-1" />
				</ScrollView>

				{/* L2 drops the footnote and the second button while they are typing. */}
				{hasText && !isFollowUp ? (
					<Pressable
						accessibilityRole="button"
						onPress={() => setStep(1)}
						className="w-full items-center justify-center overflow-hidden rounded-control bg-accent py-4 active:opacity-85"
					>
						<Text className="font-inter-semibold text-[16px] text-white">
							Continue
						</Text>
					</Pressable>
				) : (
					<>
						<Text className="w-full text-center font-inter text-[12px] leading-[16.8px] text-ink-muted">
							{isFollowUp
								? "One more question, then you're done."
								: 'Only you can read this. You can delete it anytime.'}
						</Text>

						<View className="h-3" />

						<Pressable
							accessibilityRole="button"
							accessibilityState={{ disabled: !hasText }}
							disabled={!hasText}
							onPress={finish}
							className={`w-full items-center justify-center overflow-hidden rounded-control py-4 ${
								hasText ? 'bg-accent active:opacity-85' : 'bg-hairline'
							}`}
						>
							<Text
								className={`font-inter-semibold text-[16px] ${
									hasText ? 'text-white' : 'text-ink-faint'
								}`}
							>
								Save entry
							</Text>
						</Pressable>

						<View className="h-2.5" />

						<GhostButton
							label={isFollowUp ? "That's enough for today" : 'Not now'}
							onPress={isFollowUp && wroteAnything ? finish : dismiss}
						/>
					</>
				)}
			</View>
		</KeyboardAvoidingView>
	);
}
