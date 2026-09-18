import home, { MOODS, WEEK } from '@/data/home-placeholder';
import { useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Segment fills, keyed by the tone names used in the placeholder data. */
const SEGMENT_BG = {
	accent: 'bg-accent',
	warn: 'bg-warn',
	calm: 'bg-calm',
};

const STAT_TEXT = {
	calm: 'text-calm',
	warn: 'text-warn',
	ink: 'text-ink',
};

const TOOL_BG = {
	accent: 'bg-accent',
	calm: 'bg-calm',
};

/**
 * One day in the week strip (nodes 178:11–178:38).
 *
 * A day with a single check-in is a flat 22px dot; more than one stacks into a
 * taller column of equal slices — 31px for two, 40px for three, matching the
 * frame's 22 + 9 per extra segment.
 */
function WeekDay({ day, selected, onPress }) {
	const count = day.segments.length;
	const height = count > 1 ? 22 + (count - 1) * 9 : 22;

	let pill;
	if (day.state === 'today') {
		pill = (
			<View className="size-5.5 rounded-day border-2 border-ink bg-white" />
		);
	} else if (count === 0) {
		pill = (
			<View className="size-5.5 rounded-day border border-hairline bg-white" />
		);
	} else if (count === 1) {
		pill = (
			<View className={`size-5.5 rounded-day ${SEGMENT_BG[day.segments[0]]}`} />
		);
	} else {
		pill = (
			<View
				className="w-5.5 flex-col gap-0.5 overflow-hidden rounded-day bg-white"
				style={{ height }}
			>
				{day.segments.map((tone, i) => (
					<View key={i} className={`w-full flex-1 ${SEGMENT_BG[tone]}`} />
				))}
			</View>
		);
	}

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ selected }}
			accessibilityLabel={`${day.label}, ${count} check-ins`}
			onPress={onPress}
			className={`flex-col items-center gap-1.5 ${selected ? 'opacity-100' : 'active:opacity-60'}`}
		>
			<Text
				className={
					selected
						? 'font-inter-semibold text-[11px] text-ink'
						: 'font-inter-medium text-[11px] text-ink-faint'
				}
			>
				{day.label}
			</Text>
			{pill}
		</Pressable>
	);
}

function SectionHeading({ title, action }) {
	return (
		<View className="w-full flex-row items-center justify-between">
			<Text className="font-inter-semibold text-[15px] text-ink">{title}</Text>
			<Pressable
				accessibilityRole="button"
				// TODO: no frame exists for these destinations yet.
				onPress={() => {}}
				hitSlop={8}
				className="active:opacity-60"
			>
				<Text className="font-inter-medium text-[13px] text-accent">
					{action}
				</Text>
			</Pressable>
		</View>
	);
}

/** Home dashboard — "S2 Home dashboard (multi check-in)" (Figma node 178:2). */
export default function HomeScreen() {
	const insets = useSafeAreaInsets();
	const [selectedDay, setSelectedDay] = useState(null);
	const [mood, setMood] = useState(null);
	const { user } = useUser();
	const router = useRouter();

	function settingRoute() {
		router.push('/settings');
	}

	// Clerk types firstName/lastName as `string | null`, and email + password
	// sign-ups have neither, so indexing them directly throws for exactly the
	// accounts this app creates. Fall back to the email, then to a placeholder.
	const initials =
		[user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('') ||
		user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ||
		'?';

	return (
		<View className="flex-1 bg-aura-outer">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingTop: Math.max(54, insets.top + 8),
					paddingBottom: 10,
					paddingHorizontal: 18,
				}}
			>
				<View className="w-full flex-row items-center justify-between">
					<View className="flex-col gap-0.5">
						<Text className="font-inter-bold text-[21px] text-ink">
							{home.greeting}
						</Text>
						<Text className="font-inter text-[12px] text-ink-muted">
							{home.dayLine}
						</Text>
					</View>
					{/* Avatar placeholder — the frame has no image here either. */}
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Settings"
						className="size-8.5 items-center justify-center rounded-pill bg-avatar active:opacity-70"
						onPress={settingRoute}
					>
						<Text className="font-inter-semibold text-[13px] text-ink-muted">
							{initials}
						</Text>
					</Pressable>
				</View>

				<View className="h-3.5" />

				<View className="w-full flex-row items-end justify-between">
					{WEEK.map((day, i) => (
						<WeekDay
							key={i}
							day={day}
							selected={selectedDay === i}
							onPress={() => setSelectedDay(selectedDay === i ? null : i)}
						/>
					))}
				</View>

				<View className="h-1.5" />

				<Text className="w-full font-inter text-[11px] leading-[15.62px] text-ink-faint">
					{home.weekHint}
				</Text>

				<View className="h-3.5" />

				<View className="w-full gap-2.5 overflow-hidden rounded-control bg-accent px-3.75 py-3.5">
					<Text className="w-full font-inter-bold text-[18px] leading-[25.56px] text-white">
						{home.recheck.title}
					</Text>
					<Text className="w-full font-inter text-[12px] leading-[17.04px] text-on-accent-muted">
						{home.recheck.subtitle}
					</Text>
					<View className="w-full flex-row gap-1.75">
						{MOODS.map((label) => (
							<Pressable
								key={label}
								accessibilityRole="button"
								accessibilityState={{ selected: mood === label }}
								onPress={() => {
								setMood(label);
								router.push(
									`/check-in?mood=${encodeURIComponent(label)}`,
								);
							}}
								className={`flex-1 items-center justify-center overflow-hidden rounded-chip py-2.75 active:opacity-80 ${
									mood === label ? 'bg-ink' : 'bg-white'
								}`}
							>
								<Text
									className={`font-inter-semibold text-[12px] ${
										mood === label ? 'text-white' : 'text-ink'
									}`}
								>
									{label}
								</Text>
							</Pressable>
						))}
					</View>
				</View>

				<View className="h-3" />

				<View className="w-full flex-row gap-2.25">
					{home.stats.map((stat) => (
						<View
							key={stat.lines.join(' ')}
							className="flex-1 gap-0.75 overflow-hidden rounded-control border border-hairline bg-white p-3.25"
						>
							<View className="flex-row items-baseline gap-0.75">
								<Text
									className={`font-inter-bold text-[24px] ${STAT_TEXT[stat.tone]}`}
								>
									{stat.value}
								</Text>
								{stat.unit ? (
									<Text className="font-inter-medium text-[13px] text-ink-faint">
										{stat.unit}
									</Text>
								) : null}
							</View>
							<Text className="w-full font-inter-medium text-[11px] leading-[14.85px] text-ink-muted">
								{stat.lines.join('\n')}
							</Text>
						</View>
					))}
				</View>

				<View className="h-4.5" />

				<SectionHeading title="Insights" action="See all" />

				<View className="h-2.25" />

				<View className="w-full gap-1.75 overflow-hidden rounded-control bg-insight px-3.75 py-3.5">
					<Text className="w-full font-inter-semibold text-[15px] leading-[20.4px] text-ink">
						{home.insight.title}
					</Text>
					<Text className="w-full font-inter text-[11px] leading-[15.62px] text-ink-muted">
						{home.insight.body}
					</Text>
				</View>

				<View className="h-3.5" />

				<SectionHeading title="Your BMT" action="Timeline" />

				<View className="h-2.25" />

				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ gap: 8 }}
				>
					{home.milestones.map((milestone) => (
						<View
							key={milestone.name}
							className="gap-1.75 overflow-hidden rounded-tile border border-hairline bg-white px-3 py-2.75"
						>
							<View
								className={`size-2.5 rounded-dot ${
									milestone.tone === 'upcoming'
										? 'border-1.5 border-hairline bg-white'
										: SEGMENT_BG[milestone.tone]
								}`}
							/>
							<Text
								className={`font-inter-semibold text-[13px] ${
									milestone.tone === 'upcoming' ? 'text-ink-muted' : 'text-ink'
								}`}
							>
								{milestone.name}
							</Text>
							<Text className="font-inter-medium text-[10px] text-ink-faint">
								{milestone.week}
							</Text>
						</View>
					))}
				</ScrollView>

				<View className="h-3.5" />

				<SectionHeading title="Quick tools" action="All tools" />

				<View className="h-2.25" />

				<View className="w-full flex-row gap-2.25">
					{home.tools.map((tool) => (
						<View
							key={tool.name}
							className="flex-1 gap-2 overflow-hidden rounded-control border border-hairline bg-white p-3.25"
						>
							<View className={`size-6.5 rounded-icon ${TOOL_BG[tool.tone]}`} />
							<Text className="w-full font-inter-semibold text-[13px] leading-[17.16px] text-ink">
								{tool.name}
							</Text>
							<Text className="font-inter-medium text-[11px] text-ink-faint">
								{tool.duration}
							</Text>
						</View>
					))}
				</View>
			</ScrollView>
		</View>
	);
}
