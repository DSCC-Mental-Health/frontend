import MoodMark from '@/components/MoodMark';
import Button from '@/components/ui/Button';
import TextButton from '@/components/ui/TextButton';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { INK_FAINT } from '@/constants/colors';
import { GUTTER } from '@/constants/layout';
import { MOODS } from '@/data/check-in-prompts';
import { describe, onDay, useCheckins } from '@/data/checkin-store';
import { dayKey } from '@/data/dates';
import {
	bmtDay,
	dayLabel,
	groupByDay,
	kindLabel,
	timeLabel,
	useJournal,
} from '@/data/journal-store';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

const FILTERS = ['All', ...MOODS];

const breathingRings = require('@/assets/images/breathing-rings.svg');

/** Mood as a shape as well as a colour; a dashed ring for free writes with no mood. */
function EntryMood({ mood }) {
	if (mood) return <MoodMark mood={mood} />;
	return (
		<View className="size-2.5 rounded-full border border-dashed border-ink-faint" />
	);
}

/** Does the entry's question or answer contain `query`? Case-insensitive. */
function matches(entry, query) {
	const q = query.trim().toLowerCase();
	if (!q) return true;
	return entry.parts.some(
		(p) =>
			p.text.toLowerCase().includes(q) || p.prompt?.toLowerCase().includes(q),
	);
}

/** One entry card (node 28:23): first prompt and the start of its answer. */
function EntryCard({ entry, onPress }) {
	const first = entry.parts[0] ?? { text: '' };
	const kind = kindLabel(entry.kind);

	return (
		<Pressable
			accessibilityRole="button"
			// Read as one item, mood first — the mark alone says nothing to VoiceOver.
			accessibilityLabel={[
				entry.mood ?? 'No mood',
				timeLabel(entry.createdAt),
				kind,
				first.prompt,
				first.text,
			]
				.filter(Boolean)
				.join('. ')}
			onPress={onPress}
			className="w-full gap-2 overflow-hidden rounded-lg border border-hairline bg-white px-4 py-4 active:opacity-80"
		>
			<View className="w-full flex-row items-center gap-2">
				<EntryMood mood={entry.mood} />
				<Text className="font-inter-medium text-footnote text-ink-faint">
					{timeLabel(entry.createdAt)}
				</Text>
				{entry.mood ? (
					<Text className="font-inter-medium text-caption text-ink-muted">
						{entry.mood}
					</Text>
				) : null}
				<View className="flex-1" />
				<Text className="font-inter-medium text-caption text-ink-faint">
					{kind}
				</Text>
			</View>

			{first.prompt ? (
				<Text className="w-full font-inter-semibold text-callout text-ink">
					{first.prompt}
				</Text>
			) : null}

			<Text
				numberOfLines={3}
				className="w-full font-inter text-subhead text-ink-muted"
			>
				{first.text}
			</Text>
		</Pressable>
	);
}

/** M2 Journal empty (node 27:82). */
function Empty({ onWrite }) {
	const padding = useScreenPadding();

	return (
		<View
			className="flex-1 bg-canvas"
			style={{ ...padding, paddingHorizontal: GUTTER, paddingBottom: 16 }}
		>
			<Text
				accessibilityRole="header"
				className="font-inter-bold text-large-title text-ink"
			>
				Journal
			</Text>

			{/* 60px (node 27:86) — not on Tailwind v3's spacing scale. */}
			<View style={{ height: 60 }} />

			<View className="w-full items-center gap-4 overflow-hidden rounded-lg bg-surface-muted px-6 py-7">
				{/* The frame's empty square (node 27:88) read as a missing image. */}
				<Image
					source={breathingRings}
					style={{ width: 48, height: 48 }}
					contentFit="contain"
					accessibilityIgnoresInvertColors
				/>
				<Text className="text-center font-inter-semibold text-headline text-ink">
					Nothing here yet
				</Text>
				<Text className="w-full text-center font-inter text-callout text-ink-muted">
					Entries you write after a check-in show up here. You can also write
					whenever you feel like it.
				</Text>
			</View>

			<View className="h-5" />

			<Text className="w-full text-center font-inter text-subhead text-ink-muted">
				Nobody else can see this page — not your commanders, not your section.
			</Text>

			<View className="flex-1" />

			<Button label="Write your first entry" onPress={onWrite} />
		</View>
	);
}

/** "2026-09-19" back to a local date; null if it isn't one. */
function parseDay(key) {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
	return match
		? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
		: null;
}

/** Why the list is empty — for a day, mention any mood-only check-ins. */
function emptyMessage(filter, dayDate, dayCheckins, query) {
	if (query.trim()) return `No entries match "${query.trim()}".`;
	const which = filter === 'All' ? '' : `${filter.toLowerCase()} `;
	if (!dayDate) return `No ${which}entries yet.`;
	if (dayCheckins.length === 0)
		return `Nothing logged on ${dayLabel(dayDate)}.`;
	return `No ${which}writing on ${dayLabel(dayDate)}. You checked in: ${describe(dayCheckins)}.`;
}

/** Journal — "M1 Journal list" (node 28:2), or M2 when there are no entries. */
export default function JournalScreen() {
	const padding = useScreenPadding();
	const router = useRouter();
	const entries = useJournal();
	const checkins = useCheckins();
	const [filter, setFilter] = useState('All');
	// null when the search field is closed.
	const [query, setQuery] = useState(null);
	// Set by tapping a day in Home's week strip (`?day=2026-09-19`).
	const { day } = useLocalSearchParams();
	const dayDate = typeof day === 'string' ? parseDay(day) : null;

	const write = () => router.push('/write');

	if (entries.length === 0) return <Empty onWrite={write} />;

	const inDay = dayDate
		? entries.filter((e) => dayKey(e.createdAt) === day)
		: entries;
	const byMood =
		filter === 'All' ? inDay : inDay.filter((e) => e.mood === filter);
	const visible = query ? byMood.filter((e) => matches(e, query)) : byMood;
	const dayCheckins = dayDate ? onDay(checkins, dayDate) : [];
	const groups = groupByDay(visible);

	return (
		<View className="flex-1 bg-canvas">
			<View
				className="w-full"
				style={{ ...padding, paddingHorizontal: GUTTER, paddingBottom: 16 }}
			>
				<View className="w-full flex-row items-center justify-between">
					<Text
						accessibilityRole="header"
						className="font-inter-bold text-large-title text-ink"
					>
						Journal
					</Text>
					{/* No search frame: a field under the title that filters as you type. */}
					<TextButton
						label={query === null ? 'Search' : 'Done'}
						onPress={() => setQuery(query === null ? '' : null)}
					/>
				</View>

				{query === null ? null : (
					<>
						<View className="h-3" />
						<View className="w-full flex-row items-center rounded-md border-2 border-accent bg-white px-4 py-3">
							<TextInput
								value={query}
								onChangeText={setQuery}
								accessibilityLabel="Search your entries"
								placeholder="Search your entries"
								placeholderTextColor={INK_FAINT}
								autoFocus
								autoCorrect={false}
								returnKeyType="search"
								clearButtonMode="while-editing"
								className="flex-1 p-0 font-inter text-body text-ink"
							/>
						</View>
					</>
				)}

				<Text className="font-inter text-subhead text-ink-muted">
					{entries.length} {entries.length === 1 ? 'entry' : 'entries'} · Only
					you can read these
				</Text>

				<View className="h-4" />

				<View
					accessibilityRole="radiogroup"
					className="w-full flex-row flex-wrap gap-2"
				>
					{FILTERS.map((label) => {
						const selected = filter === label;
						return (
							<Pressable
								key={label}
								accessibilityRole="radio"
								accessibilityState={{ checked: selected }}
								onPress={() => setFilter(label)}
								className={`min-h-11 flex-row items-center gap-2 overflow-hidden rounded-lg px-4 active:opacity-80 ${
									selected ? 'bg-ink' : 'border border-hairline bg-white'
								}`}
							>
								{label === 'All' ? null : <MoodMark mood={label} size={9} />}
								<Text
									className={`text-subhead ${
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

				{dayDate ? (
					<>
						<View className="h-3" />
						<View className="w-full flex-row items-center justify-between gap-3 overflow-hidden rounded-md bg-surface-muted px-4 py-3">
							<Text className="flex-1 font-inter-semibold text-subhead text-ink">
								Showing {dayLabel(dayDate)}
							</Text>
							<TextButton
								label="Show all days"
								variant="linkStrong"
								onPress={() => router.setParams({ day: undefined })}
							/>
						</View>
					</>
				) : null}
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingHorizontal: GUTTER,
					paddingTop: 8,
					paddingBottom: 12,
					gap: 20,
				}}
			>
				{groups.length === 0 ? (
					<Text className="w-full pt-4 text-center font-inter text-subhead text-ink-muted">
						{emptyMessage(filter, dayDate, dayCheckins, query ?? '')}
					</Text>
				) : null}

				{groups.map((group) => (
					<View key={group.key} className="w-full">
						<View className="w-full flex-row items-baseline gap-2">
							<Text
								accessibilityRole="header"
								className="font-inter-bold text-body text-ink"
							>
								{dayLabel(group.date)}
							</Text>
							<Text className="font-inter text-footnote text-ink-faint">
								Day {bmtDay(group.date)}
							</Text>
						</View>

						<View className="h-3" />

						<View className="w-full gap-3">
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
				className="w-full bg-canvas"
				style={{ paddingHorizontal: GUTTER, paddingTop: 12, paddingBottom: 12 }}
			>
				<Button label="Write something" onPress={write} />
			</View>
		</View>
	);
}
