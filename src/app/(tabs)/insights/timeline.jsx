import MoodMark from '@/components/MoodMark';
import Eyebrow from '@/components/ui/Eyebrow';
import TextButton from '@/components/ui/TextButton';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { GUTTER } from '@/constants/layout';
import { BMT_WEEKS, bmtDay, bmtWeek } from '@/data/dates';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

// TODO: placeholder milestones from the frame — these should come from the
// schedule entered at setup and the user's own check-ins.
const MILESTONES = [
	{ week: 1, mood: 'Mixed', title: 'Confinement', note: '5 entries. Mostly about missing home.' },
	{ week: 2, mood: 'Rough', title: 'First 4 km route march', note: 'Two rough days either side of it.' },
	{ week: 3, mood: 'Mixed', title: 'SOC', note: 'Tense before, okay after.' },
	{ week: 4, mood: 'Good', title: 'Live firing', note: 'Logged "good" the same evening.' },
	{ week: 5, mood: null, title: 'Field camp', note: 'Starts Monday. 4 days away.' },
];

/**
 * One stop on the timeline (node 176:15). The marker uses the same mood shapes
 * as Home; stops still ahead get a dashed ring and no mood.
 */
function Milestone({ milestone, isLast }) {
	const upcoming = milestone.mood === null;

	return (
		<View
			accessible
			accessibilityLabel={`Week ${milestone.week}, ${milestone.title}${
				upcoming ? ', coming up' : `, ${milestone.mood}`
			}. ${milestone.note}`}
			className="w-full flex-row gap-3"
		>
			<View className="w-3.5 items-center">
				{upcoming ? (
					<View className="size-3.5 rounded-full border-1.5 border-dashed border-ink-faint" />
				) : (
					<MoodMark mood={milestone.mood} size={14} />
				)}
				{/* Stretches to the card's height rather than the frame's fixed 62px. */}
				{isLast ? null : <View className="w-0.5 flex-1 bg-hairline" />}
			</View>

			<View className="flex-1 pb-4">
				<View
					className={`w-full gap-1 overflow-hidden rounded-md border px-3 py-3 ${
						upcoming ? 'border-avatar bg-avatar' : 'border-hairline bg-white'
					}`}
				>
					<View className="w-full flex-row items-center justify-between">
						<Eyebrow>WEEK {milestone.week}</Eyebrow>
						{upcoming ? null : (
							// Ink, not the mood colour: amber text was 1.9:1 on white.
							<View className="flex-row items-center gap-1">
								<MoodMark mood={milestone.mood} size={9} />
								<Text className="font-inter-semibold text-caption text-ink">
									{milestone.mood}
								</Text>
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
						{milestone.note}
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

	const now = new Date();
	const week = bmtWeek(now);

	function back() {
		if (router.canGoBack()) router.back();
		else router.replace('/insights');
	}

	return (
		<ScrollView
			className="flex-1 bg-aura-outer"
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
						key={milestone.week}
						milestone={milestone}
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
