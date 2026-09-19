import DiscardSheet from '@/components/DiscardSheet';
import {
	FOLLOW_ON_TOOLS,
	MAX_CHARS,
	MOOD_CHIP_BG,
	MOOD_CHIP_TEXT,
	PROMPTS,
} from '@/data/check-in-prompts';
import { add as addCheckin, attachEntry } from '@/data/checkin-store';
import { bmtDay, partOfDay } from '@/data/dates';
import { add as addJournalEntry } from '@/data/journal-store';
import { findTool } from '@/data/tools';
import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
	BackHandler,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const breathingRings = require('@/assets/images/breathing-rings.svg');

const PLACEHOLDER = '#786c62';

/** Step dots (node 22:6) — 18x6 accent for the active step, 6x6 hairline otherwise. */
function StepDots({ step }) {
	return (
		<View
			accessible
			accessibilityRole="progressbar"
			accessibilityLabel={`Question ${step + 1} of 2`}
			accessibilityValue={{ min: 1, max: 2, now: step + 1 }}
			className="flex-row items-center gap-1.5"
		>
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
			<Text className="font-inter-semibold text-[11px] tracking-[0.8px] text-ink-faint">
				A QUESTION FOR YOU
			</Text>
			<Text className="w-full font-inter-semibold text-[19px] leading-[25.65px] text-ink">
				{question}
			</Text>
		</View>
	);
}

/** Secondary white button: "Next question" and the L4 tools. */
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

function PrimaryButton({ label, disabled = false, onPress }) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ disabled }}
			disabled={disabled}
			onPress={onPress}
			className={`w-full items-center justify-center overflow-hidden rounded-control py-4 ${
				disabled ? 'bg-hairline' : 'bg-accent active:opacity-85'
			}`}
		>
			{/* Bold: white on the brand orange (3.5:1) only passes as bold text. */}
			<Text
				className={`text-[16px] ${
					disabled ? 'font-inter-semibold text-ink-faint' : 'font-inter-bold text-white'
				}`}
			>
				{label}
			</Text>
		</Pressable>
	);
}

/** L4 Saved (node 23:2). Scrolls so the tools and button survive large text. */
function Saved({ onDone, onOpenTool }) {
	const insets = useSafeAreaInsets();

	return (
		<ScrollView
			className="flex-1 bg-aura-outer"
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{
				flexGrow: 1,
				paddingHorizontal: 24,
				paddingTop: Math.max(80, insets.top + 36),
				paddingBottom: Math.max(20, insets.bottom + 8),
			}}
		>
			{/* The frame's empty teal disc (node 23:4), given the welcome screen's rings. */}
			<Image
				source={breathingRings}
				style={{ width: 56, height: 56 }}
				contentFit="contain"
				accessibilityIgnoresInvertColors
			/>

			<View className="h-6" />

			<Text
				accessibilityRole="header"
				className="w-full font-inter-bold text-[28px] leading-[39.2px] text-ink"
			>
				Saved.
			</Text>

			<View className="h-2.5" />

			<Text className="w-full font-inter text-[15px] leading-[21px] text-ink-muted">
				That&rsquo;s day {bmtDay(new Date())} logged. Writing it down is often the part
				that helps most.
			</Text>

			<View className="h-6.5" />

			<View className="w-full gap-2 overflow-hidden rounded-control bg-insight px-4.5 py-4">
				<Text className="w-full font-inter-semibold text-[13px] leading-[18.2px] text-insight-ink">
					Not going anywhere
				</Text>
				<Text className="w-full font-inter text-[14px] leading-[19.6px] text-ink">
					This entry is stored privately. Your commanders and section mates cannot see it.
				</Text>
			</View>

			<View className="h-3.5" />

			<View className="w-full gap-2.5 overflow-hidden rounded-control border border-hairline bg-white px-4.5 py-4">
				<Text className="w-full font-inter-semibold text-[14px] leading-[19.6px] text-ink">
					Feeling like doing one more thing?
				</Text>
				{FOLLOW_ON_TOOLS.map(findTool).map((tool) => (
					<GhostButton
						key={tool.id}
						label={`${tool.name}  ·  ${tool.duration}`}
						onPress={() => onOpenTool(tool)}
					/>
				))}
			</View>

			<View className="min-h-6 flex-1" />

			<Pressable
				accessibilityRole="button"
				onPress={onDone}
				className="w-full items-center justify-center overflow-hidden rounded-control bg-warn py-4 active:opacity-85"
			>
				<Text className="font-inter-semibold text-[16px] text-ink">Back to home</Text>
			</Pressable>
		</ScrollView>
	);
}

/**
 * Check-in journalling flow — L1/L2 (node 22:2, 22:33), L3 (22:115) and L4 (23:2).
 *
 * The mood is already logged when this opens (Home records it on tap and
 * passes `?checkin=<id>`). Everything here is optional writing: saving adds a
 * journal entry linked to that check-in; closing keeps the mood either way.
 */
export default function CheckInScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const navigation = useNavigation();
	const { mood: moodParam, checkin: checkinParam } = useLocalSearchParams();

	const mood = PROMPTS[moodParam] ? moodParam : 'Mixed';
	const bank = PROMPTS[mood];

	// Opened some other way than Home's chips: record the mood here, once.
	const checkinId = useRef(typeof checkinParam === 'string' ? checkinParam : null);
	useEffect(() => {
		if (!checkinId.current) checkinId.current = addCheckin(mood).id;
	}, [mood]);

	const [step, setStep] = useState(0);
	const [saved, setSaved] = useState(false);
	const [confirmingClose, setConfirmingClose] = useState(false);
	const [answers, setAnswers] = useState(['', '']);
	// Index into `bank` for each step. Step 2 never repeats step 1's question.
	const [prompts, setPrompts] = useState([0, 1]);

	const text = answers[step];
	const hasText = text.trim().length > 0;
	const dirty = answers.some((a) => a.trim().length > 0);
	const question = bank[prompts[step]];
	// Step 1 can swap with any other prompt; step 2 only with ones step 1 didn't use.
	const canCycle = step === 0 ? bank.length > 1 : bank.length > 2;

	// Once there's writing, swiping the sheet down would lose it, so that goes
	// through the same confirm as Close.
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

	function setText(value) {
		setAnswers((prev) => prev.map((a, i) => (i === step ? value : a)));
	}

	function dismiss() {
		setConfirmingClose(false);
		if (router.canGoBack()) router.back();
		else router.replace('/home');
	}

	function close() {
		if (dirty) setConfirmingClose(true);
		else dismiss();
	}

	/** Saves whatever was written as one entry; with nothing written, just closes. */
	function finish(final = answers) {
		const parts = final
			.map((t, i) => ({ prompt: bank[prompts[i]], text: t.trim() }))
			.filter((part) => part.text.length > 0);

		if (parts.length === 0) return dismiss();

		// TODO: replace the in-memory stores with the journal and check-in APIs.
		const entry = addJournalEntry({ kind: 'prompted', mood, parts });
		if (checkinId.current) attachEntry(checkinId.current, entry.id);
		setConfirmingClose(false);
		setSaved(true);
	}

	/** "Skip" skips only the current question. */
	function skip() {
		if (step === 0) {
			setStep(1);
			return;
		}
		const final = [answers[0], ''];
		setAnswers(final);
		finish(final);
	}

	function cyclePrompt() {
		setPrompts(([p0, p1]) => {
			if (step === 0) {
				const next = (p0 + 1) % bank.length;
				// Step 2 takes the first prompt step 1 isn't using.
				const follow = bank.findIndex((_, i) => i !== next);
				return [next, follow];
			}
			const free = bank.map((_, i) => i).filter((i) => i !== p0 && i !== p1);
			return [p0, free.find((i) => i > p1) ?? free[0] ?? p1];
		});
	}

	if (saved) {
		return (
			<Saved
				onDone={dismiss}
				// Replace rather than push, so closing the tool lands on home instead
				// of back on this saved screen.
				onOpenTool={(tool) => router.replace(tool.href)}
			/>
		);
	}

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
						onPress={close}
						// 14pt text is ~17pt tall; 14 either side reaches 44pt.
						hitSlop={14}
						className="active:opacity-60"
					>
						<Text className="font-inter-medium text-[14px] text-ink-muted">Close</Text>
					</Pressable>

					<StepDots step={step} />

					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Skip this question"
						onPress={skip}
						hitSlop={14}
						className="active:opacity-60"
					>
						<Text className="font-inter-medium text-[14px] text-ink-muted">Skip</Text>
					</Pressable>
				</View>

				<ScrollView
					className="flex-1"
					keyboardShouldPersistTaps="handled"
					keyboardDismissMode="interactive"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1 }}
				>
					<View className="h-6" />

					{/* Names the task and keeps the mood in view on every step. */}
					<View className="w-full flex-row items-center justify-between gap-3">
						<Text
							accessibilityRole="header"
							className="flex-1 font-inter-semibold text-[15px] text-ink"
						>
							{partOfDay(new Date())} check-in
						</Text>
						<View className={`overflow-hidden rounded-tag px-3 py-1.5 ${MOOD_CHIP_BG[mood]}`}>
							{/* Bold: white on orange/teal only passes as bold text. */}
							<Text className={`font-inter-bold text-[13px] ${MOOD_CHIP_TEXT[mood]}`}>
								Today: {mood}
							</Text>
						</View>
					</View>

					<View className="h-4" />

					{isFollowUp ? (
						<View className="w-full gap-1.5 overflow-hidden rounded-field bg-avatar px-3.5 py-3">
							<Text className="font-inter-semibold text-[11px] tracking-[0.8px] text-ink-faint">
								YOU WROTE
							</Text>
							<Text className="w-full font-inter text-[13px] leading-[18.2px] text-ink-muted">
								{answers[0].trim() || '—'}
							</Text>
						</View>
					) : (
						<Text className="w-full font-inter text-[15px] leading-[21px] text-ink-muted">
							Thanks for logging that. Want to say a bit more?
						</Text>
					)}

					<View className="h-4.5" />

					<QuestionCard question={question} />

					{canCycle ? (
						<>
							<View className="h-3" />
							<Pressable
								accessibilityRole="button"
								onPress={cyclePrompt}
								className="min-h-11 justify-center self-start overflow-hidden rounded-tag border border-hairline bg-white px-3.5 active:opacity-80"
							>
								<Text className="font-inter-medium text-[13px] text-ink">
									Ask me something else
								</Text>
							</Pressable>
						</>
					) : null}

					<View className="h-4" />

					<View
						className={`w-full gap-2 overflow-hidden rounded-control bg-white px-4 py-3.5 ${
							hasText ? 'border-1.5 border-accent' : 'border border-hairline'
						}`}
					>
						<TextInput
							value={text}
							onChangeText={setText}
							accessibilityLabel={question}
							placeholder={
								isFollowUp ? 'Type here, or skip this one.' : 'Type here. A sentence is enough.'
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

					<View className="min-h-4 flex-1" />
				</ScrollView>

				{/* The same buttons whether or not they've started typing. */}
				<Text className="w-full text-center font-inter text-[12px] leading-[16.8px] text-ink-muted">
					{isFollowUp
						? "One more question, then you're done."
						: 'Only you can read this. You can delete it anytime.'}
				</Text>

				<View className="h-3" />

				<PrimaryButton label="Save entry" disabled={!dirty} onPress={() => finish()} />

				{isFollowUp ? null : (
					<>
						<View className="h-2.5" />
						<GhostButton label="Next question" onPress={() => setStep(1)} />
					</>
				)}
			</View>

			<DiscardSheet
				visible={confirmingClose}
				body="Your mood is already logged. This is only about the words."
				onSave={() => finish()}
				onDiscard={dismiss}
				onKeep={() => setConfirmingClose(false)}
			/>
		</KeyboardAvoidingView>
	);
}
