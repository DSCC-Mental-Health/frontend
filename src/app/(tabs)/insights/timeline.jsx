import MoodMark from '@/components/MoodMark';
import { BMT_WEEKS, bmtDay, bmtWeek } from '@/data/dates';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
			className="w-full flex-row gap-3.25"
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

			<View className="flex-1 pb-3.5">
				<View
					className={`w-full gap-1.25 overflow-hidden rounded-tile border px-3.25 py-2.75 ${
						upcoming ? 'border-avatar bg-avatar' : 'border-hairline bg-white'
					}`}
				>
					<View className="w-full flex-row items-center justify-between">
						<Text className="font-inter-semibold text-[11px] tracking-[0.63px] text-ink-faint">
							WEEK {milestone.week}
						</Text>
						{upcoming ? null : (
							// Ink, not the mood colour: amber text was 1.9:1 on white.
							<View className="flex-row items-center gap-1.25">
								<MoodMark mood={milestone.mood} size={9} />
								<Text className="font-inter-semibold text-[11px] text-ink">
									{milestone.mood}
								</Text>
							</View>
						)}
					</View>
					<Text
						className={`w-full font-inter-semibold text-[15px] ${
							upcoming ? 'text-ink-muted' : 'text-ink'
						}`}
					>
						{milestone.title}
					</Text>
					<Text className="w-full font-inter text-[12px] leading-[17.04px] text-ink-muted">
						{milestone.note}
					</Text>
				</View>
			</View>
		</View>
	);
}

/** BMT timeline — "R3 BMT timeline" (node 176:2), opened from R2. */
export default function TimelineScreen() {
	const insets = useSafeAreaInsets();
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
				paddingTop: Math.max(54, insets.top + 8),
				paddingHorizontal: 18,
				paddingBottom: 24,
			}}
		>
			<Pressable
				accessibilityRole="button"
				onPress={back}
				hitSlop={14}
				className="self-start active:opacity-60"
			>
				<Text className="font-inter-medium text-[14px] text-accent-text">Insights</Text>
			</Pressable>

			<View className="h-3.5" />

			<Text accessibilityRole="header" className="w-full font-inter-bold text-[24px] text-ink">
				Your BMT timeline
			</Text>

			<View className="h-1.5" />

			<Text className="w-full font-inter text-[13px] leading-[18.46px] text-ink-muted">
				Week {week} of {BMT_WEEKS} · {bmtDay(now)} days in
			</Text>

			<View className="h-4" />

			<View
				accessibilityRole="progressbar"
				accessibilityLabel="BMT progress"
				accessibilityValue={{ min: 0, max: BMT_WEEKS, now: week }}
				className="h-2 w-full overflow-hidden rounded-mark bg-hairline"
			>
				<View
					className="h-2 rounded-mark bg-accent"
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

			<Text className="w-full font-inter text-[11px] leading-[15.62px] text-ink-muted">
				Milestone dates come from the schedule you entered at setup. Nothing here is
				shared with your unit.
			</Text>
		</ScrollView>
	);
}
