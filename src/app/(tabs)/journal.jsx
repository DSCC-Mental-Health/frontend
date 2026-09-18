import { MOOD_CHIP_BG } from '@/data/check-in-prompts';
import {
	bmtDay,
	dayLabel,
	groupByDay,
	timeLabel,
	useJournal,
} from '@/data/journal-store';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * The frame's chips (node 28:9). It has no "Okay" chip, so Okay entries are only
 * reachable under All — kept as drawn.
 */
const FILTERS = ['All', 'Rough', 'Mixed', 'Good'];

const GUTTER = 20;

function MoodDot({ mood }) {
	return (
		<View className={`size-2.5 rounded-dot ${mood ? MOOD_CHIP_BG[mood] : 'bg-hairline'}`} />
	);
}

/** One entry card (node 28:23): first prompt and the start of its answer. */
function EntryCard({ entry, onPress }) {
	const first = entry.parts[0] ?? { text: '' };

	return (
		<Pressable
			accessibilityRole="button"
			onPress={onPress}
			className="w-full gap-2 overflow-hidden rounded-control border border-hairline bg-white px-4 py-3.5 active:opacity-80"
		>
			<View className="w-full flex-row items-center gap-2">
				<MoodDot mood={entry.mood} />
				<Text className="font-inter-medium text-[12px] text-ink-faint">
					{timeLabel(entry.createdAt)}
				</Text>
				<View className="flex-1" />
				<Text className="font-inter-medium text-[11px] text-ink-faint">
					{entry.kind === 'free' ? 'Free write' : 'Prompted'}
				</Text>
			</View>

			{first.prompt ? (
				<Text className="w-full font-inter-semibold text-[14px] leading-[19.32px] text-ink">
					{first.prompt}
				</Text>
			) : null}

			<Text
				numberOfLines={3}
				className="w-full font-inter text-[13px] leading-[18.85px] text-ink-muted"
			>
				{first.text}
			</Text>
		</Pressable>
	);
}

/** M2 Journal empty (node 27:82). */
function Empty({ onWrite }) {
	const insets = useSafeAreaInsets();

	return (
		<View
			className="flex-1 bg-aura-outer"
			style={{
				paddingTop: Math.max(56, insets.top + 12),
				paddingHorizontal: GUTTER,
				paddingBottom: 16,
			}}
		>
			<Text className="font-inter-bold text-[26px] text-ink">Journal</Text>

			{/* 60px (node 27:86) — not on Tailwind v3's spacing scale. */}
			<View style={{ height: 60 }} />

			<View className="w-full items-center gap-3.5 overflow-hidden rounded-card bg-avatar px-5.5 py-7">
				{/* The frame draws an empty square here (node 27:88). */}
				<View className="size-12 rounded-control bg-hairline" />
				<Text className="text-center font-inter-semibold text-[18px] text-ink">
					Nothing here yet
				</Text>
				<Text className="w-full text-center font-inter text-[14px] leading-[20.3px] text-ink-muted">
					Entries you write after a check-in show up here. You can also write
					whenever you feel like it.
				</Text>
			</View>

			<View className="h-5" />

			<Text className="w-full text-center font-inter text-[13px] leading-[18.2px] text-ink-muted">
				Nobody else can see this page — not your commanders, not your section.
			</Text>

			<View className="flex-1" />

			<Pressable
				accessibilityRole="button"
				onPress={onWrite}
				className="w-full items-center justify-center overflow-hidden rounded-control bg-accent py-3.75 active:opacity-85"
			>
				<Text className="font-inter-semibold text-[15px] text-white">
					Write your first entry
				</Text>
			</Pressable>
		</View>
	);
}

/** Journal — "M1 Journal list" (node 28:2), or M2 when there are no entries. */
export default function JournalScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const entries = useJournal();
	const [filter, setFilter] = useState('All');

	const write = () => router.push('/write');

	if (entries.length === 0) return <Empty onWrite={write} />;

	const visible = filter === 'All' ? entries : entries.filter((e) => e.mood === filter);
	const groups = groupByDay(visible);

	return (
		<View className="flex-1 bg-aura-outer">
			<View
				className="w-full"
				style={{
					paddingTop: Math.max(56, insets.top + 12),
					paddingHorizontal: GUTTER,
					paddingBottom: 14,
				}}
			>
				<View className="w-full flex-row items-center justify-between">
					<Text className="font-inter-bold text-[26px] text-ink">Journal</Text>
					{/* TODO: no search frame yet. */}
					<Pressable accessibilityRole="button" onPress={() => {}} hitSlop={8}>
						<Text className="font-inter-medium text-[14px] text-ink-muted">
							Search
						</Text>
					</Pressable>
				</View>

				<Text className="font-inter text-[13px] text-ink-muted">
					{entries.length} {entries.length === 1 ? 'entry' : 'entries'} · Only
					you can read these
				</Text>

				<View className="h-3.5" />

				<View className="w-full flex-row gap-2">
					{FILTERS.map((label) => {
						const selected = filter === label;
						return (
							<Pressable
								key={label}
								accessibilityRole="button"
								accessibilityState={{ selected }}
								onPress={() => setFilter(label)}
								className={`overflow-hidden rounded-prompt px-3.5 py-2 active:opacity-80 ${
									selected ? 'bg-ink' : 'border border-hairline bg-white'
								}`}
							>
								<Text
									className={`text-[13px] ${
										selected
											? 'font-inter-semibold text-white'
											: 'font-inter-medium text-ink'
									}`}
								>
									{label}
								</Text>
							</Pressable>
						);
					})}
				</View>
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingHorizontal: GUTTER,
					paddingTop: 6,
					paddingBottom: 10,
					gap: 18,
				}}
			>
				{groups.length === 0 ? (
					<Text className="w-full pt-4 text-center font-inter text-[13px] text-ink-muted">
						No {filter.toLowerCase()} entries yet.
					</Text>
				) : null}

				{groups.map((group) => (
					<View key={group.key} className="w-full">
						<View className="w-full flex-row items-baseline gap-2">
							<Text className="font-inter-bold text-[15px] text-ink">
								{dayLabel(group.date)}
							</Text>
							<Text className="font-inter text-[12px] text-ink-faint">
								Day {bmtDay(group.date)}
							</Text>
						</View>

						<View className="h-2.5" />

						<View className="w-full gap-2.5">
							{group.entries.map((entry) => (
								<EntryCard
									key={entry.id}
									entry={entry}
									onPress={() => router.push(`/entry/${entry.id}`)}
								/>
							))}
						</View>
					</View>
				))}
			</ScrollView>

			<View
				className="w-full bg-aura-outer"
				style={{ paddingHorizontal: GUTTER, paddingTop: 10, paddingBottom: 12 }}
			>
				<Pressable
					accessibilityRole="button"
					onPress={write}
					className="w-full items-center justify-center overflow-hidden rounded-control bg-accent py-3.75 active:opacity-85"
				>
					<Text className="font-inter-semibold text-[15px] text-white">
						Write something
					</Text>
				</Pressable>
			</View>
		</View>
	);
}
