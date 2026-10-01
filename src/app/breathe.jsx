import Button from '@/components/ui/Button';
import TextButton from '@/components/ui/TextButton';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { CALM } from '@/constants/colors';
import { GUTTER } from '@/constants/layout';
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
	ScrollView,
	Text,
	useWindowDimensions,
	View,
} from 'react-native';

const OUTER_RING = 240;
const MIDDLE_RING = 180;
const CORE = 124;
const EMPTY_SCALE = 0.72;
const DIM = 0.55;
const LARGE_TEXT = 1.35;
const RING_TEXT_MAX = 1.3;

/** Vibration on phase change, remembered for the rest of the session. */
let vibratePreference = true;

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
		const sub = AccessibilityInfo.addEventListener(
			'reduceMotionChanged',
			setReduce,
		);
		return () => sub.remove();
	}, []);
	return reduce;
}

export default function BreatheScreen() {
	const padding = useScreenPadding({ bottom: 40, bottomGap: 16 });
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
	}, [
		running,
		done,
		cycle,
		phaseIndex,
		phase.scale,
		reduceMotion,
		scale,
		fade,
	]);

	// Phase changes are the one thing people must not miss: tell VoiceOver (the
	// live region below only works on Android) and tap once if they want it.
	useEffect(() => {
		if (done) {
			AccessibilityInfo.announceForAccessibility('Done. That’s the set.');
			return;
		}
		AccessibilityInfo.announceForAccessibility(
			`${phase.label}, ${phase.seconds}`,
		);
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
		<View className="flex-1 bg-calm-strong">
			<StatusBar style="light" />

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					flexGrow: 1,
					paddingHorizontal: GUTTER,
					...padding,
				}}
			>
				<View className="w-full flex-row items-center justify-between">
					<TextButton label="Close" variant="navLight" onPress={close} />
					{/* Replaces the frame's static "Sound off": the player is always silent,
					    so the one real choice is whether phase changes vibrate. */}
					<TextButton
						label={`Vibrate: ${vibrate ? 'On' : 'Off'}`}
						variant="navLight"
						role="switch"
						accessibilityLabel="Vibrate on each phase"
						accessibilityState={{ checked: vibrate }}
						onPress={toggleVibrate}
					/>
				</View>

				<View className="min-h-8 flex-1" />

				<View className="w-full items-center justify-center">
					<View
						className="items-center justify-center rounded-full bg-white/15"
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
							<View className="size-full items-center justify-center rounded-full bg-white/30">
								<Animated.View
									style={{
										width: CORE * ring,
										height: CORE * ring,
										borderRadius: (CORE * ring) / 2,
										backgroundColor: CALM,
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
								className="font-inter-semibold text-headline text-white"
							>
								{done ? 'Done' : phase.label}
							</Text>
							{done ? null : (
								// Full white: 70% white on the teal core was 2.8:1.
								<Text
									maxFontSizeMultiplier={RING_TEXT_MAX}
									className="font-inter-bold text-large-title text-white"
								>
									{left}
								</Text>
							)}
						</View>
					</View>
				</View>

				<View className="h-10" />

				<Text className="w-full text-center font-inter text-body-lg text-white">
					{done
						? 'That’s the set. Take one normal breath before you get up.'
						: phase.guide}
				</Text>

				<View className="h-3" />

				<Text className="w-full text-center font-inter text-subhead text-on-dark">
					{done
						? `All ${cycles} cycles done`
						: `Cycle ${cycle + 1} of ${cycles}  ·  ${
								running ? remainingLabel(secondsLeft) : 'paused'
							}`}
				</Text>

				<View className="min-h-8 flex-1" />

				<Button
					label={done ? 'Finish' : running ? 'Pause' : 'Resume'}
					tone="onDark"
					onPress={done ? close : () => setRunning((r) => !r)}
				/>

				<View className="h-3" />

				<Text className="w-full text-center font-inter text-footnote text-on-dark-muted">
					You can stop whenever. Nothing is logged.
				</Text>
			</ScrollView>
		</View>
	);
}
