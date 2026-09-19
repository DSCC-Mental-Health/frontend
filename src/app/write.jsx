import DiscardSheet from '@/components/DiscardSheet';
import Eyebrow from '@/components/ui/Eyebrow';
import TextButton from '@/components/ui/TextButton';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { PROMPTS } from '@/data/check-in-prompts';
import { add } from '@/data/journal-store';
import { HOME_PROMPT } from '@/data/tools';
import { useAuth } from '@clerk/expo';
import { Redirect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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

const PLACEHOLDER = '#786c62';
const GUTTER = 20;

/** Every prompt in the L5 bank, for "Give me a question instead". */
const BANK = Object.values(PROMPTS).flat();

function SuggestionRow({ label, onPress }) {
	return (
		<Pressable
			accessibilityRole="button"
			onPress={onPress}
			className="min-h-11 w-full justify-center overflow-hidden rounded-field border border-hairline bg-white px-3.5 py-3 active:opacity-80"
		>
			<Text className="w-full font-inter-medium text-[13px] leading-[18.2px] text-ink">
				{label}
			</Text>
		</Pressable>
	);
}

/**
 * Free write — "M4 Free write" (node 29:32), presented as a modal.
 *
 * Picking a suggestion attaches it as the entry's prompt, which turns it into a
 * prompted entry; the frame doesn't specify this, so it's a stated assumption.
 * The Worry list and Three good things tools open it with `?prompt=` preset.
 */
export default function WriteScreen() {
	const padding = useScreenPadding({ bottom: 16, bottomGap: 8 });
	const router = useRouter();
	const navigation = useNavigation();
	const { isLoaded, isSignedIn } = useAuth();
	const { prompt: promptParam } = useLocalSearchParams();

	const [text, setText] = useState('');
	const [prompt, setPrompt] = useState(
		typeof promptParam === 'string' && promptParam ? promptParam : null,
	);
	const [confirmingClose, setConfirmingClose] = useState(false);

	const canSave = text.trim().length > 0;

	// Swiping the sheet down or Android back would lose the writing, so both go
	// through the same "Keep what you wrote?" confirm as Cancel.
	useEffect(() => {
		navigation.setOptions({ gestureEnabled: !canSave });
	}, [navigation, canSave]);

	useEffect(() => {
		if (!canSave) return undefined;
		const sub = BackHandler.addEventListener('hardwareBackPress', () => {
			setConfirmingClose(true);
			return true;
		});
		return () => sub.remove();
	}, [canSave]);

	if (!isLoaded) return null;
	if (!isSignedIn) return <Redirect href="/login" />;

	function dismiss() {
		setConfirmingClose(false);
		if (router.canGoBack()) router.back();
		else router.replace('/journal');
	}

	function cancel() {
		if (canSave) setConfirmingClose(true);
		else dismiss();
	}

	function save() {
		if (!canSave) return;
		add({
			kind: prompt ? 'prompted' : 'free',
			mood: null,
			parts: [prompt ? { prompt, text: text.trim() } : { text: text.trim() }],
		});
		dismiss();
	}

	function pickQuestion() {
		const others = BANK.filter((q) => q !== prompt);
		setPrompt(others[Math.floor(Math.random() * others.length)]);
	}

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-aura-outer"
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<View className="flex-1" style={padding}>
				<View
					className="w-full flex-row items-center justify-between"
					style={{ paddingHorizontal: GUTTER }}
				>
					<TextButton label="Cancel" onPress={cancel} />
					<TextButton label="Save" variant="navStrong" disabled={!canSave} onPress={save} />
				</View>

				<ScrollView
					className="flex-1"
					keyboardShouldPersistTaps="handled"
					keyboardDismissMode="interactive"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1, paddingHorizontal: GUTTER, paddingTop: 24 }}
				>
					<Text
						accessibilityRole="header"
						className="w-full font-inter-bold text-[24px] leading-[34.8px] text-ink"
					>
						What&rsquo;s on your mind?
					</Text>

					<View className="h-2" />

					<Text className="w-full font-inter text-[14px] leading-[20.3px] text-ink-muted">
						{prompt
							? 'Answer the question below, or clear it and write whatever.'
							: 'No prompt, no structure. Write whatever.'}
					</Text>

					<View className="h-5" />

					{prompt ? (
						<>
							<View className="w-full gap-1.5 overflow-hidden rounded-control bg-avatar px-4 py-3.5">
								<View className="w-full flex-row items-center justify-between">
									<Eyebrow>A QUESTION FOR YOU</Eyebrow>
									<TextButton
										label="Clear"
										variant="small"
										accessibilityLabel="Remove question"
										onPress={() => setPrompt(null)}
									/>
								</View>
								<Text className="w-full font-inter-medium text-[14px] leading-[20.3px] text-ink">
									{prompt}
								</Text>
							</View>
							<View className="h-3" />
						</>
					) : null}

					{/* 200px tall (node 29:42) — not on Tailwind v3's spacing scale. */}
					<View
						className="w-full overflow-hidden rounded-control border border-hairline bg-white px-4 py-3.5"
						style={{ height: 200 }}
					>
						<TextInput
							value={text}
							onChangeText={setText}
							accessibilityLabel={prompt ?? 'Your entry'}
							placeholder="Start typing…"
							placeholderTextColor={PLACEHOLDER}
							multiline
							textAlignVertical="top"
							className="flex-1 p-0 font-inter text-[15px] leading-[21.75px] text-ink"
						/>
					</View>

					<View className="h-4" />

					<Text
						accessibilityRole="header"
						className="w-full font-inter-semibold text-[13px] leading-[18.85px] text-ink"
					>
						Stuck?
					</Text>

					<View className="h-2.5" />

					<View className="w-full gap-2">
						<SuggestionRow label="Give me a question instead" onPress={pickQuestion} />
						<SuggestionRow label={HOME_PROMPT} onPress={() => setPrompt(HOME_PROMPT)} />
					</View>

					<View className="min-h-6 flex-1" />

					{/* The frame said "Saved only to your device account" — not true yet. */}
					<Text className="w-full text-center font-inter text-[12px] leading-[17.4px] text-ink-muted">
						Only you can read this. You can delete it anytime.
					</Text>
				</ScrollView>
			</View>

			<DiscardSheet
				visible={confirmingClose}
				onSave={save}
				onDiscard={dismiss}
				onKeep={() => setConfirmingClose(false)}
			/>
		</KeyboardAvoidingView>
	);
}
