import { BREATHING } from '@/data/tools';
import { keepAwake, lightTap, releaseAwake } from '@/lib/device';
import { useAuth } from '@clerk/expo';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useReducer, useRef, useState } from 'react';
import {
	AccessibilityInfo,
	Animated,
	Easing,
	Pressable,
	ScrollView,
	Text,
	useWindowDimensions,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 240/180/124px (nodes 33:8–33:10) aren't on Tailwind v3's spacing scale.
const OUTER_RING = 240;
const MIDDLE_RING = 180;
const CORE = 124;
// Where the ring rests before the first breath in, so that breath visibly grows.
const EMPTY_SCALE = 0.72;
// Under Reduce Motion the ring holds still and the core fades between these.
const DIM = 0.55;
/** Text scale at which the ring shrinks to leave room for the words. */
const LARGE_TEXT = 1.35;
/** The words inside the ring can't outgrow the 124pt core. */
const RING_TEXT_MAX = 1.3;

/** Vibration on phase change, remembered for the rest of the session. */
let vibratePreference = true;

/** One second passes: count down, or move to the next phase, cycle, or finish. */
function tick(state, { phases, cycles }) {
	if (state.done) return state;
	if (state.left > 1) return { ...state, left: state.left - 1 };

	const phaseIndex = (state.phaseIndex + 1) % phases.length;
	const cycle = phaseIndex === 0 ? state.cycle + 1 : state.cycle;
	if (cycle >= cycles) return { ...state, left: 0, done: true };
	return { cycle, phaseIndex, left: phases[phaseIndex].seconds, done: false };
}

function remainingLabel(seconds) {
	if (seconds < 60) return 'under a minute left';
	return `about ${Math.ceil(seconds / 60)} min left`;
}

/** Follows the system Reduce Motion setting, including changes mid-exercise. */
function useReduceMotion() {
	const [reduce, setReduce] = useState(false);
	useEffect(() => {
		AccessibilityInfo.isReduceMotionEnabled()
			.then(setReduce)
			.catch(() => {});
		const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
		return () => sub.remove();
	}, []);
	return reduce;
}

/**
 * Breathing player — "N2 Breathing (active)" (node 33:2).
 *
 * Runs `?pattern=box|exhale` from the tools library. Ticks once a second; the
 * middle ring eases toward each phase's size over that phase's length, or —
 * with Reduce Motion on — stays still while the core fades. Each phase change
 * is announced to VoiceOver and, if on, marked with one light vibration.
 */
export default function BreatheScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { fontScale } = useWindowDimensions();
	const { isLoaded, isSignedIn } = useAuth();
	const { pattern: patternParam } = useLocalSearchParams();
	const reduceMotion = useReduceMotion();

	const pattern = BREATHING[patternParam] ?? BREATHING.box;
	const { phases, cycles } = pattern;

	const [{ cycle, phaseIndex, left, done }, advance] = useReducer(tick, {
		cycle: 0,
		phaseIndex: 0,
		left: phases[0].seconds,
		done: false,
	});
	const [running, setRunning] = useState(true);
	const [vibrate, setVibrate] = useState(vibratePreference);

	const scale = useRef(new Animated.Value(EMPTY_SCALE)).current;
	const fade = useRef(new Animated.Value(DIM)).current;
	// Read by the effects below without restarting them every second.
	const leftRef = useRef(left);
	leftRef.current = left;
	const vibrateRef = useRef(vibrate);
	vibrateRef.current = vibrate;

	const phase = phases[phaseIndex];

	// A 2–3 minute exercise with no touches would otherwise hit auto-lock.
	useEffect(() => {
		keepAwake('breathe');
		return () => releaseAwake('breathe');
	}, []);

	useEffect(() => {
		if (!running || done) return undefined;

		const id = setInterval(() => advance({ phases, cycles }), 1000);
		return () => clearInterval(id);
	}, [running, done, phases, cycles]);

	useEffect(() => {
		if (!running) return undefined;

		const duration = done ? 600 : leftRef.current * 1000;
		const expanded = !done && phase.scale === 1;
		const animation = reduceMotion
			? Animated.timing(fade, {
					toValue: expanded ? 1 : DIM,
					duration,
					easing: Easing.inOut(Easing.sin),
					useNativeDriver: true,
				})
			: Animated.timing(scale, {
					toValue: done ? EMPTY_SCALE : phase.scale,
					duration,
					easing: Easing.inOut(Easing.sin),
					useNativeDriver: true,
				});
		if (reduceMotion) scale.setValue(1);
		else fade.setValue(1);
		animation.start();
		return () => animation.stop();
	}, [running, done, cycle, phaseIndex, phase.scale, reduceMotion, scale, fade]);

	// Phase changes are the one thing people must not miss: tell VoiceOver (the
	// live region below only works on Android) and tap once if they want it.
	useEffect(() => {
		if (done) {
			AccessibilityInfo.announceForAccessibility('Done. That’s the set.');
			return;
		}
		AccessibilityInfo.announceForAccessibility(`${phase.label}, ${phase.seconds}`);
		if (vibrateRef.current) lightTap();
	}, [cycle, phaseIndex, done, phase.label, phase.seconds]);

	if (!isLoaded) return null;
	if (!isSignedIn) return <Redirect href="/login" />;

	function close() {
		if (router.canGoBack()) router.back();
		else router.replace('/tools');
	}

	function toggleVibrate() {
		vibratePreference = !vibrate;
		setVibrate(!vibrate);
	}

	const cycleSeconds = phases.reduce((sum, p) => sum + p.seconds, 0);
	const restOfCycle = phases
		.slice(phaseIndex + 1)
		.reduce((sum, p) => sum + p.seconds, 0);
	const secondsLeft = left + restOfCycle + (cycles - cycle - 1) * cycleSeconds;

	// At large text sizes the ring gives up some room to the words around it.
	const ring = fontScale >= LARGE_TEXT ? 0.75 : 1;

	return (
		<View className="flex-1 bg-insight-ink">
			<StatusBar style="light" />

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					flexGrow: 1,
					paddingHorizontal: 24,
					paddingTop: Math.max(56, insets.top + 12),
					paddingBottom: Math.max(40, insets.bottom + 16),
				}}
			>
				<View className="w-full flex-row items-center justify-between">
					<Pressable
						accessibilityRole="button"
						onPress={close}
						// 14pt text is ~17pt tall; 14 either side reaches 44pt.
						hitSlop={14}
						className="active:opacity-60"
					>
						<Text className="font-inter-medium text-[14px] text-white">Close</Text>
					</Pressable>
					{/* Replaces the frame's static "Sound off": the player is always silent,
					    so the one real choice is whether phase changes vibrate. */}
					<Pressable
						accessibilityRole="switch"
						accessibilityLabel="Vibrate on each phase"
						accessibilityState={{ checked: vibrate }}
						onPress={toggleVibrate}
						hitSlop={14}
						className="active:opacity-60"
					>
						<Text className="font-inter-medium text-[14px] text-white">
							Vibrate: {vibrate ? 'On' : 'Off'}
						</Text>
					</Pressable>
				</View>

				<View className="min-h-8 flex-1" />

				<View className="w-full items-center justify-center">
					<View
						className="items-center justify-center rounded-full bg-breath-ring-outer"
						style={{ width: OUTER_RING * ring, height: OUTER_RING * ring }}
					>
						{/* Inline styles only: className isn't wired up on Animated.View. */}
						<Animated.View
							style={{
								width: MIDDLE_RING * ring,
								height: MIDDLE_RING * ring,
								transform: [{ scale }],
							}}
						>
							<View className="size-full items-center justify-center rounded-full bg-breath-ring-inner">
								<Animated.View
									style={{
										width: CORE * ring,
										height: CORE * ring,
										borderRadius: (CORE * ring) / 2,
										// `calm` in tailwind.config.js — inline, as above.
										backgroundColor: '#4d8a81',
										opacity: fade,
									}}
								/>
							</View>
						</Animated.View>

						{/* Kept outside the scaled ring so the words stay a steady size. */}
						<View
							accessible
							accessibilityLiveRegion="polite"
							accessibilityLabel={done ? 'Done' : `${phase.label}, ${left}`}
							className="absolute inset-0 items-center justify-center"
						>
							<Text
								maxFontSizeMultiplier={RING_TEXT_MAX}
								className="font-inter-semibold text-[18px] text-white"
							>
								{done ? 'Done' : phase.label}
							</Text>
							{done ? null : (
								// Full white: 70% white on the teal core was 2.8:1.
								<Text
									maxFontSizeMultiplier={RING_TEXT_MAX}
									className="font-inter-bold text-[30px] text-white"
								>
									{left}
								</Text>
							)}
						</View>
					</View>
				</View>

				<View className="h-10" />

				<Text className="w-full text-center font-inter text-[16px] leading-[23.2px] text-white">
					{done ? 'That’s the set. Take one normal breath before you get up.' : phase.guide}
				</Text>

				<View className="h-2.5" />

				<Text className="w-full text-center font-inter text-[13px] leading-[18.85px] text-breath-meta">
					{done
						? `All ${cycles} cycles done`
						: `Cycle ${cycle + 1} of ${cycles}  ·  ${
								running ? remainingLabel(secondsLeft) : 'paused'
							}`}
				</Text>

				<View className="min-h-8 flex-1" />

				<Pressable
					accessibilityRole="button"
					onPress={done ? close : () => setRunning((r) => !r)}
					className="w-full items-center justify-center overflow-hidden rounded-control border-1.5 border-breath-outline py-3.75 active:opacity-70"
				>
					<Text className="font-inter-semibold text-[15px] text-white">
						{done ? 'Finish' : running ? 'Pause' : 'Resume'}
					</Text>
				</Pressable>

				<View className="h-2.5" />

				<Text className="w-full text-center font-inter text-[12px] leading-[17.4px] text-breath-hint">
					You can stop whenever. Nothing is logged.
				</Text>
			</ScrollView>
		</View>
	);
}
