import MoodMark from '@/components/MoodMark';
import MilestonePrompt from '@/components/reflection/MilestonePrompt';
import ToolIcon from '@/components/ToolIcon';
import SectionHeading from '@/components/ui/SectionHeading';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { GUTTER } from '@/constants/layout';
import { MOODS } from '@/data/check-in-prompts';
import {
	add as addCheckin,
	describe,
	latestToday,
	useCheckins,
	weekOf,
} from '@/data/checkin-store';
import {
	BMT_WEEKS,
	bmtDay,
	bmtWeek,
	dayKey,
	partOfDay,
	timeLabel,
} from '@/data/dates';
import home from '@/data/home-placeholder';
import { useJournal } from '@/data/journal-store';
import {
	MILESTONES,
	daysSinceEnd,
	dismissPrompt,
	duePrompt,
	milestoneMood,
	milestoneWeek,
	relativeLabel,
} from '@/data/milestones';
import { COPING } from '@/data/onboarding';
import { findTool } from '@/data/tools';
import { useUser } from '@clerk/expo';
import { useIsFocused, useRouter } from 'expo-router';
import { useReducer } from 'react';
import {
	Pressable,
	ScrollView,
	Text,
	useWindowDimensions,
	View,
} from 'react-native';

/** Shown when onboarding recorded no coping picks. */
const DEFAULT_TOOLS = ['box', 'worry'];

/**
 * Mood marks are 10pt with 4pt between (the track's `gap-1`); the track pads
 * 8pt and never goes below its 24pt width, so an empty day is a circle.
 */
const MARK = 10;
const MARK_GAP = 4;
const TRACK_PAD = 8;
const TRACK_MIN = 24;

/** Text scale at which the four mood chips stop fitting on one row. */
const LARGE_TEXT = 1.35;

/** The tools picked on I5, which I8 promised would be on the home screen. */
function quickTools(user) {
	const picked = user?.unsafeMetadata?.onboarding?.coping ?? [];
	const ids = COPING.filter((c) => picked.includes(c.id)).map((c) => c.toolId);
	return (ids.length > 0 ? ids : DEFAULT_TOOLS).map(findTool).filter(Boolean);
}

function dayA11yLabel(day) {
	if (day.isFuture) return `${day.name}, not yet`;
	const today = day.isToday ? ', today' : '';
	if (day.checkins.length === 0) return `${day.name}${today}: no check-ins`;
	return `${day.name}${today}: ${describe(day.checkins)}`;
}

/**
 * One day in the week strip (nodes 178:11–178:38): a letter over a track that
 * stacks that day's check-ins as mood marks, oldest at the top. Today's track
 * has a dark outline; days still to come are dashed.
 */
function WeekDay({ day, onPress }) {
	const count = day.checkins.length;
	const height = Math.max(
		TRACK_MIN,
		count * MARK + (count - 1) * MARK_GAP + TRACK_PAD,
	);

	let track = '';
	if (day.isToday) track = '';
	else if (day.isFuture) track = 'border border-dashed border-ink-faint';

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={dayA11yLabel(day)}
			accessibilityHint={
				day.isFuture ? undefined : 'Opens this day in your journal'
			}
			accessibilityState={{ disabled: day.isFuture }}
			disabled={day.isFuture}
			onPress={onPress}
			// flex-1 splits the row seven ways (≈48pt each), well over 44pt.
			className="min-h-11 flex-1 items-center gap-2 py-1 active:opacity-60"
		>
			<Text
				className={
					day.isToday
						? 'font-inter-bold text-caption text-ink'
						: 'font-inter-medium text-caption text-ink-muted'
				}
			>
				{day.letter}
			</Text>
			<View
				className={`w-6 items-center justify-center gap-1 rounded-md ${track}`}
				style={{ height }}
			>
				{day.checkins.map((c) => (
					<MoodMark key={c.id} mood={c.mood} size={MARK} />
				))}
			</View>
		</Pressable>
	);
}

/** What each mark means — the strip can't rely on colour or shape being guessed. */
function MoodKey() {
	return (
		<View
			accessible
			accessibilityLabel="Key: square rough, diamond mixed, ring okay, dot good"
			className="w-full flex-row flex-wrap items-center gap-x-3 gap-y-1"
		>
			{MOODS.map((mood) => (
				<View key={mood} className="flex-row items-center gap-1">
					<MoodMark mood={mood} size={9} />
					<Text className="font-inter-medium text-caption text-ink-muted">
						{mood}
					</Text>
				</View>
			))}
		</View>
	);
}

/** Home dashboard — "S2 Home dashboard (multi check-in)" (Figma node 178:2). */
export default function HomeScreen() {
	const padding = useScreenPadding();
	const { fontScale } = useWindowDimensions();
	const { user } = useUser();
	const router = useRouter();
	const checkins = useCheckins();
	const entries = useJournal();
	// The prompt sheet is a modal, so it must not open while another tab is showing.
	const focused = useIsFocused();
	// Dismissals live in data/milestones.js; this re-renders Home after one.
	const [, refresh] = useReducer((n) => n + 1, 0);

	const now = new Date();
	const prompt = focused ? duePrompt(entries, now) : null;

	// Every way out of the sheet means "not today", including going on to the
	// flow — closing that flow shouldn't bring the sheet straight back.
	function dismiss() {
		dismissPrompt(prompt.kind, prompt.milestone.id, now);
		refresh();
	}

	function open(pathname) {
		const { id } = prompt.milestone;
		dismiss();
		router.push({ pathname, params: { id } });
	}
	const week = weekOf(checkins, now);
	const latest = latestToday(checkins, now);
	const chipsWrap = fontScale >= LARGE_TEXT;

	const greeting = user?.firstName
		? `${partOfDay(now)}, ${user.firstName}`
		: `Good ${partOfDay(now).toLowerCase()}`;

	// Clerk types firstName/lastName as `string | null`, and email + password
	// sign-ups have neither, so indexing them directly throws for exactly the
	// accounts this app creates. Fall back to the email, then to a placeholder.
	const initials =
		[user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('') ||
		user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ||
		'?';

	// The mood is logged on tap, before any writing; the check-in screen only
	// adds words to it.
	function logMood(mood) {
		const checkin = addCheckin(mood);
		router.push({
			pathname: '/check-in',
			params: { mood, checkin: checkin.id },
		});
	}

	return (
		<View className="flex-1 bg-canvas">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					...padding,
					paddingBottom: 12,
					paddingHorizontal: GUTTER,
				}}
			>
				<View className="w-full flex-row items-center justify-between">
					<View className="flex-1 flex-col gap-0.5">
						<Text
							accessibilityRole="header"
							className="font-inter-bold text-large-title text-ink"
						>
							{greeting}
						</Text>
						<Text className="font-inter text-footnote text-ink-muted">
							Day {bmtDay(now)} · Week {bmtWeek(now)} of {BMT_WEEKS}
						</Text>
					</View>
					{/* Avatar placeholder — the frame has no image here either. */}
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Settings"
						// 36pt circle + 4 each side = 44pt.
						hitSlop={4}
						className="size-9 items-center justify-center rounded-full bg-surface-muted active:opacity-70"
						onPress={() => router.push('/settings')}
					>
						<Text className="font-inter-semibold text-subhead text-ink-muted">
							{initials}
						</Text>
					</Pressable>
				</View>

				<View className="h-4" />

				<View className="w-full flex-row items-end">
					{week.map((day) => (
						<WeekDay
							key={day.letter + day.date.getDate()}
							day={day}
							onPress={() => router.push(`/journal?day=${dayKey(day.date)}`)}
						/>
					))}
				</View>

				<View className="h-2" />

				<MoodKey />

				<View className="h-1" />

				<Text className="w-full font-inter text-caption text-ink-muted">
					Tap a day to open it in your journal.
				</Text>

				<View className="h-4" />

				{/* Darker than the button orange so white text passes 4.5:1 (5.2:1). */}
				<View className="w-full gap-3 overflow-hidden rounded-lg bg-accent-strong px-4 py-4">
					<Text
						accessibilityRole="header"
						className="w-full font-inter-bold text-headline text-white"
					>
						{latest ? 'Check in again?' : 'How’s today been?'}
					</Text>
					<Text className="w-full font-inter text-footnote text-white">
						{latest
							? `You logged "${latest.mood.toLowerCase()}" at ${timeLabel(latest.createdAt)}. Things can shift.`
							: 'One tap is enough. Writing more is up to you.'}
					</Text>
					<View
						className={`w-full flex-row gap-2 ${chipsWrap ? 'flex-wrap' : ''}`}
					>
						{MOODS.map((label) => {
							const current = latest?.mood === label;
							return (
								<Pressable
									key={label}
									accessibilityRole="button"
									accessibilityLabel={`Log ${label}`}
									accessibilityHint={
										current ? 'Your latest check-in today' : undefined
									}
									accessibilityState={{ selected: current }}
									onPress={() => logMood(label)}
									className={`min-h-11 items-center justify-center overflow-hidden rounded-md px-1 py-3 active:opacity-80 ${
										chipsWrap ? 'basis-[47%] grow' : 'flex-1'
									} ${current ? 'bg-ink' : 'bg-white'}`}
								>
									<Text
										className={`font-inter-semibold text-footnote ${
											current ? 'text-white' : 'text-ink'
										}`}
									>
										{label}
									</Text>
								</Pressable>
							);
						})}
					</View>
				</View>

				<View className="h-5" />

				<SectionHeading
					title="Insights"
					action="See all"
					onAction={() => router.push('/insights')}
				/>

				<View className="h-2" />

				{/* TODO: placeholder insight until the insights API exists. */}
				<View className="w-full gap-2 overflow-hidden rounded-lg bg-calm-surface px-4 py-4">
					<Text className="w-full font-inter-semibold text-body text-ink">
						{home.insight.title}
					</Text>
					<Text className="w-full font-inter text-caption text-ink-muted">
						{home.insight.body}
					</Text>
				</View>

				<View className="h-4" />

				<SectionHeading
					title="Your BMT"
					action="Timeline"
					onAction={() => router.push('/insights/timeline')}
				/>

				<View className="h-2" />

				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ gap: 8 }}
				>
					{/* The last week's milestones and the ones ahead. */}
					{MILESTONES.filter((m) => daysSinceEnd(m, now) <= 7).map((milestone) => {
						const mood = milestoneMood(entries, milestone, now);
						return (
							<View
								key={milestone.id}
								accessible
								accessibilityLabel={`${milestone.title}, week ${milestoneWeek(milestone)}, ${
									mood ?? relativeLabel(milestone, now)
								}`}
								className="gap-2 overflow-hidden rounded-md border border-hairline bg-white px-3 py-3"
							>
								{mood ? (
									<MoodMark mood={mood} />
								) : (
									<View className="size-2.5 rounded-full border-2 border-dashed border-ink-faint" />
								)}
								<Text
									className={`font-inter-semibold text-subhead ${
										mood ? 'text-ink' : 'text-ink-muted'
									}`}
								>
									{milestone.title}
								</Text>
								<Text className="font-inter-medium text-caption text-ink-faint">
									Wk {milestoneWeek(milestone)}
								</Text>
							</View>
						);
					})}
				</ScrollView>

				<View className="h-4" />

				<SectionHeading
					title="Quick tools"
					action="All tools"
					onAction={() => router.push('/tools')}
				/>

				<View className="h-2" />

				{/* Wraps to a second row when more than two tools were picked. */}
				<View className="w-full flex-row flex-wrap gap-2">
					{quickTools(user).map((tool) => (
						<Pressable
							key={tool.id}
							accessibilityRole="button"
							accessibilityLabel={`${tool.name}, ${tool.duration}`}
							onPress={() => router.push(tool.href)}
							className="min-w-[45%] flex-1 gap-2 overflow-hidden rounded-lg border border-hairline bg-white p-3 active:opacity-80"
						>
							<ToolIcon tool={tool} size={26} />
							<Text className="w-full font-inter-semibold text-subhead text-ink">
								{tool.name}
							</Text>
							<Text className="font-inter-medium text-caption text-ink-faint">
								{tool.duration}
							</Text>
						</Pressable>
					))}
				</View>
			</ScrollView>

			<MilestonePrompt
				prompt={prompt}
				onReflect={() => open('/reflect/[id]')}
				onExpect={() => open('/expect/[id]')}
				onDismiss={dismiss}
			/>
		</View>
	);
}
