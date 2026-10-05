import MoodMark from '@/components/MoodMark';
import Eyebrow from '@/components/ui/Eyebrow';
import TextButton from '@/components/ui/TextButton';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { GUTTER } from '@/constants/layout';
import { BMT_WEEKS, bmtDay, bmtWeek } from '@/data/dates';
import { useJournal } from '@/data/journal-store';
import {
	MILESTONES,
	expectationOf,
	isOver,
	milestoneMood,
	milestoneWeek,
	reflectionFor,
	relativeLabel,
} from '@/data/milestones';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

/**
 * What a stop's card says: a saved reflection's result, a sample note for past
 * milestones nobody reflected on, or how far away it is.
 */
function noteFor(entries, milestone, now) {
	const saved = reflectionFor(entries, milestone.id);
	if (saved) return `${expectationOf(saved.answers.expectation)?.result ?? 'Reflected on'}.`;
	if (isOver(milestone, now) && milestone.sampleNote) return milestone.sampleNote;
	return relativeLabel(milestone, now);
}

/**
 * One stop on the timeline (node 176:15). The marker uses the same mood shapes
 * as Home; stops with no mood yet (today, or still ahead) get a dashed ring.
 */
function Milestone({ milestone, mood, note, isLast }) {
	const upcoming = mood === null;
	const week = milestoneWeek(milestone);

	return (
		<View
			accessible
			accessibilityLabel={`Week ${week}, ${milestone.title}${
				upcoming ? '' : `, ${mood}`
			}. ${note}`}
			className="w-full flex-row gap-3"
		>
			<View className="w-3.5 items-center">
				{upcoming ? (
					<View className="size-3.5 rounded-full border-2 border-dashed border-ink-faint" />
				) : (
					<MoodMark mood={mood} size={14} />
				)}
				{/* Stretches to the card's height rather than the frame's fixed 62px. */}
				{isLast ? null : <View className="w-0.5 flex-1 bg-hairline" />}
			</View>

			<View className="flex-1 pb-4">
				<View
					className={`w-full gap-1 overflow-hidden rounded-md border px-3 py-3 ${
						upcoming ? 'border-surface-muted bg-surface-muted' : 'border-hairline bg-white'
					}`}
				>
					<View className="w-full flex-row items-center justify-between">
						<Eyebrow>WEEK {week}</Eyebrow>
						{upcoming ? null : (
							// Ink, not the mood colour: amber text was 1.9:1 on white.
							<View className="flex-row items-center gap-1">
								<MoodMark mood={mood} size={9} />
								<Text className="font-inter-semibold text-caption text-ink">{mood}</Text>
							</View>
						)}
					</View>
					<Text
						className={`w-full font-inter-semibold text-body ${
							upcoming ? 'text-ink-muted' : 'text-ink'
						}`}
					>
						{milestone.title}
					</Text>
					<Text className="w-full font-inter text-footnote text-ink-muted">
						{note}
					</Text>
				</View>
			</View>
		</View>
	);
}

/** BMT timeline — "R3 BMT timeline" (node 176:2), opened from R2. */
export default function TimelineScreen() {
	const padding = useScreenPadding();
	const router = useRouter();

	const entries = useJournal();
	const now = new Date();
	const week = bmtWeek(now);

	function back() {
		if (router.canGoBack()) router.back();
		else router.replace('/insights');
	}

	return (
		<ScrollView
			className="flex-1 bg-canvas"
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{
				...padding,
				paddingHorizontal: GUTTER,
				paddingBottom: 24,
			}}
		>
			<TextButton
				label="Insights"
				variant="navAccent"
				accessibilityLabel="Back to Insights"
				onPress={back}
				className="self-start"
			/>

			<View className="h-4" />

			<Text accessibilityRole="header" className="w-full font-inter-bold text-large-title text-ink">
				Your BMT timeline
			</Text>

			<View className="h-2" />

			<Text className="w-full font-inter text-subhead text-ink-muted">
				Week {week} of {BMT_WEEKS} · {bmtDay(now)} days in
			</Text>

			<View className="h-4" />

			<View
				accessibilityRole="progressbar"
				accessibilityLabel="BMT progress"
				accessibilityValue={{ min: 0, max: BMT_WEEKS, now: week }}
				className="h-2 w-full overflow-hidden rounded-full bg-hairline"
			>
				<View
					className="h-2 rounded-full bg-accent"
					style={{ width: `${Math.min(week / BMT_WEEKS, 1) * 100}%` }}
				/>
			</View>

			<View className="h-5" />

			<View className="w-full">
				{MILESTONES.map((milestone, i) => (
					<Milestone
						key={milestone.id}
						milestone={milestone}
						mood={milestoneMood(entries, milestone, now)}
						note={noteFor(entries, milestone, now)}
						isLast={i === MILESTONES.length - 1}
					/>
				))}
			</View>

			<View className="h-2" />

			<Text className="w-full font-inter text-caption text-ink-muted">
				Milestone dates come from the schedule you entered at setup. Nothing here is
				shared with your unit.
			</Text>
		</ScrollView>
	);
}
