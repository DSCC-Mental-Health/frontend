import { PROMPTS } from '@/data/check-in-prompts';
import { add } from '@/data/journal-store';
import { useAuth } from '@clerk/expo';
import { Redirect, useRouter } from 'expo-router';
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
const GUTTER = 20;

/** The frame's one concrete suggestion (node 29:51). */
const HOME_PROMPT = "What's one thing about today I'd tell someone at home?";

/** Every prompt in the L5 bank, for "Give me a question instead". */
const BANK = Object.values(PROMPTS).flat();

function SuggestionRow({ label, onPress }) {
	return (
		<Pressable
			accessibilityRole="button"
			onPress={onPress}
			className="w-full overflow-hidden rounded-field border border-hairline bg-white px-3.5 py-3 active:opacity-80"
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
 */
export default function WriteScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { isLoaded, isSignedIn } = useAuth();

	const [text, setText] = useState('');
	const [prompt, setPrompt] = useState(null);

	if (!isLoaded) return null;
	if (!isSignedIn) return <Redirect href="/login" />;

	const canSave = text.trim().length > 0;

	function dismiss() {
		if (router.canGoBack()) router.back();
		else router.replace('/journal');
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
			<View
				className="flex-1"
				style={{
					paddingTop: Math.max(56, insets.top + 12),
					paddingBottom: Math.max(16, insets.bottom + 8),
				}}
			>
				<View
					className="w-full flex-row items-center justify-between"
					style={{ paddingHorizontal: GUTTER }}
				>
					<Pressable accessibilityRole="button" onPress={dismiss} hitSlop={10}>
						<Text className="font-inter-medium text-[14px] text-ink-muted">
							Cancel
						</Text>
					</Pressable>
					<Pressable
						accessibilityRole="button"
						accessibilityState={{ disabled: !canSave }}
						disabled={!canSave}
						onPress={save}
						hitSlop={10}
					>
						<Text
							className={
								canSave
									? 'font-inter-semibold text-[14px] text-accent'
									: 'font-inter-medium text-[14px] text-ink-faint'
							}
						>
							Save
						</Text>
					</Pressable>
				</View>

				<ScrollView
					className="flex-1"
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1, paddingHorizontal: GUTTER, paddingTop: 24 }}
				>
					<Text className="w-full font-inter-bold text-[24px] leading-[34.8px] text-ink">
						What&rsquo;s on your mind?
					</Text>

					<View className="h-2" />

					<Text className="w-full font-inter text-[14px] leading-[20.3px] text-ink-muted">
						No prompt, no structure. Write whatever.
					</Text>

					<View className="h-5" />

					{prompt ? (
						<>
							<View className="w-full gap-1.5 overflow-hidden rounded-control bg-avatar px-4 py-3.5">
								<View className="w-full flex-row items-center justify-between">
									<Text className="font-inter-semibold text-[10px] tracking-[0.8px] text-ink-faint">
										A QUESTION FOR YOU
									</Text>
									<Pressable
										accessibilityRole="button"
										accessibilityLabel="Remove question"
										onPress={() => setPrompt(null)}
										hitSlop={10}
									>
										<Text className="font-inter-medium text-[12px] text-ink-muted">
											Clear
										</Text>
									</Pressable>
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
							placeholder="Start typing…"
							placeholderTextColor={PLACEHOLDER}
							multiline
							textAlignVertical="top"
							className="flex-1 p-0 font-inter text-[15px] leading-[21.75px] text-ink"
						/>
					</View>

					<View className="h-4" />

					<Text className="w-full font-inter-semibold text-[13px] leading-[18.85px] text-ink">
						Stuck?
					</Text>

					<View className="h-2.5" />

					<View className="w-full gap-2">
						<SuggestionRow label="Give me a question instead" onPress={pickQuestion} />
						<SuggestionRow label={HOME_PROMPT} onPress={() => setPrompt(HOME_PROMPT)} />
					</View>

					<View className="min-h-6 flex-1" />

					{/* Kept from the frame, though today entries live only in memory. */}
					<Text className="w-full text-center font-inter text-[12px] leading-[17.4px] text-ink-muted">
						Saved only to your device account. You can delete it anytime.
					</Text>
				</ScrollView>
			</View>
		</KeyboardAvoidingView>
	);
}
