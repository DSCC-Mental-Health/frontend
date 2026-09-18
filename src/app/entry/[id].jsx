import Sheet from '@/components/Sheet';
import { MOOD_CHIP_BG } from '@/data/check-in-prompts';
import {
	bmtDay,
	dayLabel,
	remove,
	timeLabel,
	useJournal,
} from '@/data/journal-store';
import { useAuth } from '@clerk/expo';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GUTTER = 20;

/** "YOU WERE ASKED" / "FOLLOW-UP" card (nodes 29:14, 29:20). */
function PromptCard({ label, prompt }) {
	return (
		<View className="w-full gap-1.5 overflow-hidden rounded-control bg-avatar px-4 py-3.5">
			<Text className="font-inter-semibold text-[10px] tracking-[0.8px] text-ink-faint">
				{label}
			</Text>
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

			<Text className="w-full font-inter text-[14px] leading-[20.3px] text-ink-muted">
				It&rsquo;ll be removed from your journal and from the patterns Steady shows
				you. This can&rsquo;t be undone.
			</Text>

			<View className="h-4.5" />

			<View className="w-full gap-1 overflow-hidden rounded-control bg-danger-surface px-4 py-3.5">
				<Text className="w-full font-inter-semibold text-[12px] leading-[17.4px] text-danger">
					Already anonymous in reporting
				</Text>
				<Text className="w-full font-inter text-[12px] leading-[17.4px] text-ink">
					This entry never appeared in any commander view, so nothing needs
					retracting there.
				</Text>
			</View>

			<View className="h-5" />

			<Pressable
				accessibilityRole="button"
				onPress={onConfirm}
				className="w-full items-center justify-center overflow-hidden rounded-control bg-danger py-3.75 active:opacity-85"
			>
				<Text className="font-inter-semibold text-[15px] text-white">
					Delete entry
				</Text>
			</Pressable>

			<View className="h-2.5" />

			<Pressable
				accessibilityRole="button"
				onPress={onCancel}
				className="w-full items-center justify-center overflow-hidden rounded-control border border-hairline bg-white py-3.75 active:opacity-80"
			>
				<Text className="font-inter-semibold text-[15px] text-ink">Keep it</Text>
			</Pressable>
		</Sheet>
	);
}

/** Entry detail — "M3 Entry detail" (node 29:2). */
export default function EntryScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { id } = useLocalSearchParams();
	const { isLoaded, isSignedIn } = useAuth();
	const entries = useJournal();

	const [confirming, setConfirming] = useState(false);
	const [leaving, setLeaving] = useState(false);

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

	function handleDelete() {
		setLeaving(true);
		setConfirming(false);
		remove(entry.id);
		back();
	}

	return (
		<View
			className="flex-1 bg-aura-outer"
			style={{
				paddingTop: Math.max(56, insets.top + 12),
				paddingBottom: Math.max(16, insets.bottom + 8),
			}}
		>
			<View
				className="w-full flex-row items-center justify-between"
				style={{ paddingHorizontal: GUTTER }}
			>
				<Pressable accessibilityRole="button" onPress={back} hitSlop={10}>
					<Text className="font-inter-medium text-[14px] text-ink-muted">Back</Text>
				</Pressable>
				{/* TODO: no edit frame yet — reusing free write, prefilled, is the obvious route. */}
				<Pressable accessibilityRole="button" onPress={() => {}} hitSlop={10}>
					<Text className="font-inter-medium text-[14px] text-ink-muted">Edit</Text>
				</Pressable>
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ flexGrow: 1, paddingHorizontal: GUTTER, paddingTop: 24 }}
			>
				<View className="w-full flex-row items-center gap-2.5">
					<View
						className={`size-3.5 rounded-full ${
							entry.mood ? MOOD_CHIP_BG[entry.mood] : 'bg-hairline'
						}`}
					/>
					<Text className="font-inter-semibold text-[16px] text-ink">
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
							<Text className="w-full font-inter text-[15px] leading-[21.75px] text-ink">
								{part.text}
							</Text>
						</View>
					))}
				</View>

				<View className="min-h-6 flex-1" />

				<View className="w-full gap-1 overflow-hidden rounded-control bg-insight px-4 py-3.5">
					<Text className="w-full font-inter-semibold text-[12px] leading-[17.4px] text-calm">
						Private to you
					</Text>
					<Text className="w-full font-inter text-[12px] leading-[17.4px] text-ink-muted">
						Not visible to commanders or your section.
					</Text>
				</View>

				<View className="h-3" />

				<Pressable
					accessibilityRole="button"
					onPress={() => setConfirming(true)}
					className="w-full items-center justify-center overflow-hidden rounded-control border border-danger bg-white py-3.75 active:opacity-80"
				>
					<Text className="font-inter-semibold text-[15px] text-danger">
						Delete this entry
					</Text>
				</Pressable>
			</ScrollView>

			<DeleteSheet
				visible={confirming}
				onConfirm={handleDelete}
				onCancel={() => setConfirming(false)}
			/>
		</View>
	);
}
