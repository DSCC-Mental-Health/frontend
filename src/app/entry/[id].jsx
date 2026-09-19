import MoodMark from '@/components/MoodMark';
import Sheet from '@/components/Sheet';
import Button from '@/components/ui/Button';
import Eyebrow from '@/components/ui/Eyebrow';
import TextButton from '@/components/ui/TextButton';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { detachEntry } from '@/data/checkin-store';
import {
	bmtDay,
	dayLabel,
	remove,
	timeLabel,
	update,
	useJournal,
} from '@/data/journal-store';
import { useAuth } from '@clerk/expo';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	View,
} from 'react-native';

const GUTTER = 20;
const PLACEHOLDER = '#786c62';

/** "YOU WERE ASKED" / "FOLLOW-UP" card (nodes 29:14, 29:20). */
function PromptCard({ label, prompt }) {
	return (
		<View className="w-full gap-1.5 overflow-hidden rounded-control bg-avatar px-4 py-3.5">
			<Eyebrow>{label}</Eyebrow>
			<Text className="w-full font-inter-medium text-[14px] leading-[20.3px] text-ink">
				{prompt}
			</Text>
		</View>
	);
}

/** M5 Delete confirm (node 29:54). */
function DeleteSheet({ visible, onConfirm, onCancel }) {
	return (
		<Sheet visible={visible} onClose={onCancel}>
			<Text className="w-full font-inter-bold text-[20px] leading-[29px] text-ink">
				Delete this entry?
			</Text>

			<View className="h-2.5" />

			{/* The frame also said "and from the patterns Steady shows you", but
			    Insights doesn't use entries yet. */}
			<Text className="w-full font-inter text-[14px] leading-[20.3px] text-ink-muted">
				It&rsquo;ll be removed from your journal. Your mood check-in stays. This
				can&rsquo;t be undone.
			</Text>

			<View className="h-4.5" />

			<View className="w-full gap-1 overflow-hidden rounded-control bg-danger-surface px-4 py-3.5">
				<Text className="w-full font-inter-semibold text-[12px] leading-[17.4px] text-danger">
					Already anonymous in reporting
				</Text>
				<Text className="w-full font-inter text-[12px] leading-[17.4px] text-ink">
					This entry never appeared in any commander view, so nothing needs retracting
					there.
				</Text>
			</View>

			<View className="h-5" />

			<Button label="Delete entry" tone="danger" size="md" onPress={onConfirm} />

			<View className="h-2.5" />

			<Button label="Cancel" tone="secondary" size="md" onPress={onCancel} />
		</Sheet>
	);
}

/**
 * Entry detail — "M3 Entry detail" (node 29:2), with M5's delete sheet.
 *
 * Edit has no frame: it turns each answer into a text field in place, keeping
 * the questions as they were asked. Cancel drops the changes — that's what
 * people expect from Cancel, so it doesn't ask.
 */
export default function EntryScreen() {
	const padding = useScreenPadding({ bottom: 16, bottomGap: 8 });
	const router = useRouter();
	const { id } = useLocalSearchParams();
	const { isLoaded, isSignedIn } = useAuth();
	const entries = useJournal();

	const [confirming, setConfirming] = useState(false);
	const [leaving, setLeaving] = useState(false);
	// Draft answers while editing; null when not editing.
	const [draft, setDraft] = useState(null);

	if (!isLoaded) return null;
	if (!isSignedIn) return <Redirect href="/login" />;

	const entry = entries.find((e) => e.id === id);

	function back() {
		if (router.canGoBack()) router.back();
		else router.replace('/journal');
	}

	// Mid-delete the entry vanishes before navigation finishes; render nothing
	// rather than bouncing through the not-found redirect.
	if (!entry) return leaving ? null : <Redirect href="/journal" />;

	const editing = draft !== null;
	const canSaveEdit = editing && draft.some((t) => t.trim().length > 0);

	function handleDelete() {
		setLeaving(true);
		setConfirming(false);
		remove(entry.id);
		// The mood check-in stays; it just no longer points at this entry.
		detachEntry(entry.id);
		back();
	}

	function saveEdit() {
		update(
			entry.id,
			draft.map((t) => t.trim()),
		);
		setDraft(null);
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
					{editing ? (
						<>
							<TextButton label="Cancel" onPress={() => setDraft(null)} />
							<TextButton
								label="Save"
								variant="navStrong"
								disabled={!canSaveEdit}
								onPress={saveEdit}
							/>
						</>
					) : (
						<>
							<TextButton label="Back" onPress={back} />
							<TextButton label="Edit" onPress={() => setDraft(entry.parts.map((p) => p.text))} />
						</>
					)}
				</View>

				<ScrollView
					className="flex-1"
					keyboardShouldPersistTaps="handled"
					keyboardDismissMode="interactive"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1, paddingHorizontal: GUTTER, paddingTop: 24 }}
				>
					<View className="w-full flex-row items-center gap-2.5">
						{entry.mood ? (
							<MoodMark mood={entry.mood} size={14} />
						) : (
							<View className="size-3.5 rounded-full border-1.5 border-dashed border-ink-faint" />
						)}
						<Text accessibilityRole="header" className="font-inter-semibold text-[16px] text-ink">
							{entry.mood ?? 'Free write'}
						</Text>
					</View>

					<View className="h-1.5" />

					<Text className="w-full font-inter text-[13px] leading-[18.85px] text-ink-faint">
						{dayLabel(entry.createdAt)}, {timeLabel(entry.createdAt)} · Day{' '}
						{bmtDay(entry.createdAt)} of BMT
					</Text>

					<View className="h-5.5" />

					<View className="w-full gap-5">
						{entry.parts.map((part, i) => (
							<View key={i} className="w-full gap-4">
								{part.prompt ? (
									<PromptCard
										label={i === 0 ? 'YOU WERE ASKED' : 'FOLLOW-UP'}
										prompt={part.prompt}
									/>
								) : null}
								{editing ? (
									<View className="w-full overflow-hidden rounded-control border-1.5 border-accent bg-white px-4 py-3.5">
										<TextInput
											value={draft[i]}
											onChangeText={(value) =>
												setDraft((prev) => prev.map((t, j) => (j === i ? value : t)))
											}
											accessibilityLabel={part.prompt ?? 'Your entry'}
											placeholder="Type here."
											placeholderTextColor={PLACEHOLDER}
											multiline
											autoFocus={i === 0}
											textAlignVertical="top"
											className="min-h-24 w-full p-0 font-inter text-[15px] leading-[21.75px] text-ink"
										/>
									</View>
								) : (
									<Text className="w-full font-inter text-[15px] leading-[21.75px] text-ink">
										{part.text}
									</Text>
								)}
							</View>
						))}
					</View>

					<View className="min-h-6 flex-1" />

					<View className="w-full gap-1 overflow-hidden rounded-control bg-insight px-4 py-3.5">
						<Text className="w-full font-inter-semibold text-[12px] leading-[17.4px] text-insight-ink">
							Private to you
						</Text>
						<Text className="w-full font-inter text-[12px] leading-[17.4px] text-ink-muted">
							Not visible to commanders or your section.
						</Text>
					</View>

					{editing ? null : (
						<>
							<View className="h-3" />

							<Button
								label="Delete this entry"
								tone="dangerOutline"
								size="md"
								onPress={() => setConfirming(true)}
							/>
						</>
					)}
				</ScrollView>
			</View>

			<DeleteSheet
				visible={confirming}
				onConfirm={handleDelete}
				onCancel={() => setConfirming(false)}
			/>
		</KeyboardAvoidingView>
	);
}
