import { summarize, useCheckins } from '@/data/checkin-store';
import { useAiSummaries } from '@/lib/ai-summaries';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Text scale at which the three stat cards stack instead of sitting side by side. */
const LARGE_TEXT = 1.35;

// TODO: examples of what the insights API will produce. They're labelled as
// examples on screen until real summaries, drivers and patterns exist.
const EXAMPLE_SUMMARY = {
	headline: "You do better once things start than while you're waiting for them.",
	body: 'Before the 8 km march and live firing your entries were tense. Both evenings after, you logged "good".',
};

/** `strength` is how many of the five segments are filled. */
const EXAMPLE_DRIVERS = [
	{ label: 'Days you finish a milestone', effect: 'steadier', strength: 4 },
	{ label: 'Talking to someone in your section', effect: 'steadier', strength: 3 },
	{ label: 'Sunday book-in nights', effect: 'harder', strength: 4 },
	{ label: 'Waiting before a big event', effect: 'harder', strength: 3 },
];

const EXAMPLE_PATTERNS = [
	{
		label: 'YOUR SECTION',
		text: 'Wei Jie appears in 5 entries — nearly always on steadier days.',
	},
	{
		label: 'WEEKLY',
		text: '4 of your 5 "rough" check-ins were Sunday book-in nights.',
	},
];

const RANGES = [
	{ id: 'week', label: 'This Week' },
	{ id: 'bmt', label: 'All of BMT' },
];

const STRENGTH_WORDS = ['', 'slightly', 'somewhat', 'fairly', 'strongly', 'very strongly'];

/** "This Week" / "All of BMT" switch (node 175:6). */
function RangeToggle({ value, onChange }) {
	return (
		<View
			accessibilityRole="radiogroup"
			className="w-full flex-row gap-0.75 overflow-hidden rounded-banner bg-avatar p-0.75"
		>
			{RANGES.map((range) => {
				const selected = value === range.id;
				return (
					<Pressable
						key={range.id}
						accessibilityRole="radio"
						accessibilityState={{ checked: selected }}
						onPress={() => onChange(range.id)}
						className={`min-h-11 flex-1 items-center justify-center overflow-hidden rounded-icon ${
							selected ? 'bg-white' : 'bg-avatar active:opacity-70'
						}`}
					>
						<Text
							className={
								selected
									? 'font-inter-semibold text-[13px] text-ink'
									: 'font-inter-medium text-[13px] text-ink-muted'
							}
						>
							{range.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

/** Real counts from the check-in store for the chosen range. */
function Stats({ range, stacked }) {
	const checkins = useCheckins();
	const counts = summarize(checkins, range);
	const week = range === 'week';

	const stats = [
		{
			value: counts.steadier,
			label: week ? 'steadier days\nthis week' : 'steadier days\nso far',
			tone: 'text-insight-ink',
		},
		{
			value: counts.rough,
			label: week ? `rough days\n(${counts.lastWeekRough} last week)` : 'rough days\nso far',
			tone: 'text-accent-text',
		},
		{
			value: counts.checkins,
			label: week ? 'check-ins\nthis week' : 'check-ins\nall time',
			tone: 'text-ink',
		},
	];

	return (
		<View className={`w-full gap-2.25 ${stacked ? 'flex-col' : 'flex-row'}`}>
			{stats.map((stat) => (
				<View
					key={stat.label}
					accessible
					accessibilityLabel={`${stat.value} ${stat.label.replace('\n', ' ')}`}
					className={`gap-0.75 overflow-hidden rounded-control border border-hairline bg-white p-3.25 ${
						stacked ? 'w-full' : 'flex-1'
					}`}
				>
					<Text className={`font-inter-bold text-[24px] ${stat.tone}`}>{stat.value}</Text>
					<Text className="w-full font-inter-medium text-[11px] leading-[14.85px] text-ink-muted">
						{stacked ? stat.label.replace('\n', ' ') : stat.label}
					</Text>
				</View>
			))}
		</View>
	);
}

/** The dark summary card (node 175:12): asks first, then shows the summary. */
function SummaryCard({ enabled, set, saving, error, onSettings }) {
	if (enabled === null) {
		return (
			<View className="w-full gap-2.75 overflow-hidden rounded-control bg-insight-ink px-3.75 py-3.5">
				<Text accessibilityRole="header" className="w-full font-inter-bold text-[18px] leading-[23.76px] text-white">
					Want a weekly summary?
				</Text>
				<Text className="w-full font-inter text-[13px] leading-[19.24px] text-insight-body">
					Steady can send this week&rsquo;s check-ins and journal entries to an AI model
					(Claude) to write a short summary of your patterns. It describes; it
					doesn&rsquo;t diagnose. Your unit never sees it, and you can turn it off any time
					in Settings.
				</Text>
				{error ? (
					<Text accessibilityRole="alert" className="w-full font-inter-semibold text-[13px] text-white">
						{error}
					</Text>
				) : null}
				<View className="w-full flex-row gap-2">
					<Pressable
						accessibilityRole="button"
						disabled={saving}
						onPress={() => set(true)}
						className="min-h-11 flex-1 items-center justify-center overflow-hidden rounded-field bg-white active:opacity-80"
					>
						<Text className="font-inter-bold text-[14px] text-insight-ink">
							{saving ? 'Saving…' : 'Turn on'}
						</Text>
					</Pressable>
					<Pressable
						accessibilityRole="button"
						disabled={saving}
						onPress={() => set(false)}
						className="min-h-11 flex-1 items-center justify-center overflow-hidden rounded-field border border-insight-meta active:opacity-80"
					>
						<Text className="font-inter-semibold text-[14px] text-white">Not now</Text>
					</Pressable>
				</View>
			</View>
		);
	}

	if (enabled === false) {
		return (
			<View className="w-full flex-row items-center gap-3 overflow-hidden rounded-control border border-hairline bg-white px-3.75 py-3.5">
				<Text className="flex-1 font-inter text-[13px] leading-[18.85px] text-ink-muted">
					AI summaries are off. The counts below come only from your check-ins.
				</Text>
				<Pressable accessibilityRole="link" onPress={onSettings} hitSlop={14}>
					<Text className="font-inter-semibold text-[13px] text-accent-text">Settings</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<View className="w-full gap-2.75 overflow-hidden rounded-control bg-insight-ink px-3.75 py-3.5">
			<View className="self-start overflow-hidden rounded-dot bg-insight-tag px-2 py-1">
				<Text className="font-inter-semibold text-[11px] tracking-[0.63px] text-white">
					EXAMPLE SUMMARY
				</Text>
			</View>
			<Text className="w-full font-inter-bold text-[18px] leading-[23.76px] text-white">
				{EXAMPLE_SUMMARY.headline}
			</Text>
			<Text className="w-full font-inter text-[13px] leading-[19.24px] text-insight-body">
				{EXAMPLE_SUMMARY.body}
			</Text>
			<Text className="w-full font-inter text-[11px] leading-[15.4px] text-insight-meta">
				Your own summary appears here after a week of check-ins. AI-written, describes
				patterns only.
			</Text>
		</View>
	);
}

/** One row of "What moves your days" (node 175:37). */
function Driver({ label, effect, strength }) {
	const steadier = effect === 'steadier';

	return (
		<View
			accessible
			accessibilityLabel={`${label}: ${STRENGTH_WORDS[strength]} ${effect}, ${strength} of 5`}
			className="w-full gap-1.75"
		>
			<View className="w-full flex-row items-center gap-2">
				<Text className="flex-1 font-inter-medium text-[13px] leading-[17.94px] text-ink">
					{label}
				</Text>
				<Text
					className={`font-inter-semibold text-[11px] ${
						steadier ? 'text-insight-ink' : 'text-accent-text'
					}`}
				>
					{effect}
				</Text>
			</View>
			<View className="w-full flex-row gap-0.75">
				{[0, 1, 2, 3, 4].map((i) => (
					<View
						key={i}
						// Empty segments are outlined, not a pale fill, so they stay visible.
						className={`h-1.25 flex-1 rounded-full ${
							i < strength
								? steadier
									? 'bg-calm'
									: 'bg-accent'
								: 'border border-ink-faint bg-white'
						}`}
					/>
				))}
			</View>
		</View>
	);
}

/** Section heading with an optional link (nodes 175:33, 175:80, 175:93). */
function SectionHeader({ title, action, onAction }) {
	return (
		<View className="w-full flex-row items-center justify-between">
			<Text accessibilityRole="header" className="font-inter-semibold text-[15px] text-ink">
				{title}
			</Text>
			{action ? (
				<Pressable accessibilityRole="link" onPress={onAction} hitSlop={14}>
					<Text className="font-inter-medium text-[13px] text-accent-text">{action}</Text>
				</Pressable>
			) : null}
		</View>
	);
}

/** Insights — "R2 Insights" (node 175:2). */
export default function InsightsScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { fontScale } = useWindowDimensions();
	const ai = useAiSummaries();
	const [range, setRange] = useState('week');

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
			<Text accessibilityRole="header" className="font-inter-bold text-[24px] text-ink">
				Insights
			</Text>

			<View className="h-3" />

			<RangeToggle value={range} onChange={setRange} />

			<View className="h-4" />

			<SummaryCard {...ai} onSettings={() => router.push('/settings')} />

			<View className="h-3.5" />

			<Stats range={range} stacked={fontScale >= LARGE_TEXT} />

			<View className="h-4.5" />

			<SectionHeader title="What moves your days" />

			<View className="h-2.25" />

			<View className="w-full gap-3.25 overflow-hidden rounded-control border border-hairline bg-white px-3.75 py-3.5">
				{EXAMPLE_DRIVERS.map((driver) => (
					<Driver key={driver.label} {...driver} />
				))}
			</View>

			<View className="h-2" />

			<Text className="w-full font-inter text-[11px] leading-[15.62px] text-ink-muted">
				Examples. Yours appear after a few weeks of check-ins, and show associations in
				your own logs — not proof of cause.
			</Text>

			{/* Patterns come from what people write, so they need the AI consent too. */}
			{ai.enabled ? (
				<>
					<View className="h-4.5" />

					<SectionHeader title="Patterns noticed" />

					<View className="h-2.25" />

					<View className="w-full gap-2">
						{EXAMPLE_PATTERNS.map((pattern) => (
							<View
								key={pattern.label}
								className="w-full gap-1.5 overflow-hidden rounded-control border border-hairline bg-white px-3.75 py-3.5"
							>
								<Text className="w-full font-inter-semibold text-[11px] tracking-[0.63px] text-ink-faint">
									EXAMPLE · {pattern.label}
								</Text>
								<Text className="w-full font-inter-medium text-[14px] leading-[19.32px] text-ink">
									{pattern.text}
								</Text>
							</View>
						))}
					</View>
				</>
			) : null}

			<View className="h-4" />

			<SectionHeader
				title="Your BMT timeline"
				action="Open"
				onAction={() => router.push('/insights/timeline')}
			/>
		</ScrollView>
	);
}
