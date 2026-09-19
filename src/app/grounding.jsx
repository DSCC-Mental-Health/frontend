import Button from '@/components/ui/Button';
import TextButton from '@/components/ui/TextButton';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { GROUNDING_STEPS } from '@/data/tools';
import { useAuth } from '@clerk/expo';
import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const breathingRings = require('@/assets/images/breathing-rings.svg');

/** The 72pt count stays glanceable but can't take over the screen at huge text sizes. */
const COUNT_MAX_SCALE = 1.5;

/** A "Got one" row (node 33:38); unticked rows read "Tap when you've named one". */
function NamedRow({ ticked, onPress }) {
	return (
		<Pressable
			accessibilityRole="checkbox"
			accessibilityState={{ checked: ticked }}
			onPress={onPress}
			className={`w-full flex-row items-center gap-3 overflow-hidden rounded-tile border px-3.5 py-3.25 active:opacity-80 ${
				ticked ? 'border-insight bg-insight' : 'border-hairline bg-white'
			}`}
		>
			<View
				className={`size-5 items-center justify-center rounded-full ${
					ticked ? 'bg-calm' : 'border-1.5 border-ink-faint'
				}`}
			>
				{ticked ? <Text className="font-inter-bold text-[11px] text-white">✓</Text> : null}
			</View>
			<Text
				className={`font-inter-medium text-[14px] ${ticked ? 'text-ink' : 'text-ink-faint'}`}
			>
				{ticked ? 'Got one' : 'Tap when you’ve named one'}
			</Text>
		</Pressable>
	);
}

/** Shown after step 5, so finishing is a moment rather than the screen vanishing. */
function Finished({ onDone }) {
	const padding = useScreenPadding({ top: 80, topGap: 36, bottom: 40, bottomGap: 16 });

	return (
		<View className="flex-1 bg-aura-outer px-6" style={padding}>
			<Image
				source={breathingRings}
				style={{ width: 56, height: 56 }}
				contentFit="contain"
				accessibilityIgnoresInvertColors
			/>
			<View className="h-6" />
			<Text
				accessibilityRole="header"
				className="w-full font-inter-bold text-[28px] leading-[39.2px] text-ink"
			>
				Done.
			</Text>
			<View className="h-2.5" />
			<Text className="w-full font-inter text-[16px] leading-[23.2px] text-ink-muted">
				Notice how you feel now compared with when you started. You can come back to
				this any time.
			</Text>
			<View className="flex-1" />
			<Button label="Close" tone="calm" size="md" onPress={onDone} />
		</View>
	);
}

/**
 * 5-4-3-2-1 grounding — "N3 Grounding (step)" (node 33:22).
 *
 * Each row ticks and unticks itself. Next is always available — "No timer. Go
 * at your own pace." — and Back returns to the previous step.
 */
export default function GroundingScreen() {
	const padding = useScreenPadding({ bottom: 40, bottomGap: 16 });
	const router = useRouter();
	const { isLoaded, isSignedIn } = useAuth();

	const [stepIndex, setStepIndex] = useState(0);
	// Indexes of the rows ticked on this step.
	const [ticked, setTicked] = useState([]);
	const [finished, setFinished] = useState(false);

	if (!isLoaded) return null;
	if (!isSignedIn) return <Redirect href="/login" />;

	function close() {
		if (router.canGoBack()) router.back();
		else router.replace('/tools');
	}

	if (finished) return <Finished onDone={close} />;

	const step = GROUNDING_STEPS[stepIndex];
	const total = GROUNDING_STEPS.length;
	const isLast = stepIndex === total - 1;

	function goTo(index) {
		setStepIndex(index);
		setTicked([]);
	}

	function next() {
		if (isLast) setFinished(true);
		else goTo(stepIndex + 1);
	}

	function toggle(i) {
		setTicked((prev) => (prev.includes(i) ? prev.filter((t) => t !== i) : [...prev, i]));
	}

	return (
		<View className="flex-1 bg-aura-outer" style={padding}>
			<View className="w-full px-6">
				<View className="w-full flex-row items-center justify-between">
					<TextButton label="Close" onPress={close} />
					<View className="flex-row items-center gap-4">
						{stepIndex > 0 ? (
							<TextButton
								label="Back"
								accessibilityLabel="Back to the previous step"
								onPress={() => goTo(stepIndex - 1)}
							/>
						) : null}
						<Text className="font-inter-medium text-[14px] text-ink-muted">
							Step {stepIndex + 1} of {total}
						</Text>
					</View>
				</View>

				<View className="h-5" />

				<View
					accessibilityRole="progressbar"
					accessibilityLabel="Grounding progress"
					accessibilityValue={{ min: 0, max: total, now: stepIndex + 1 }}
					className="h-1.5 w-full overflow-hidden rounded-progress bg-hairline"
				>
					<View
						className="h-1.5 rounded-progress bg-calm"
						style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
					/>
				</View>
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
			>
				<View className="min-h-6 flex-1" />

				{/* Read as one heading: "4 things you can feel". */}
				<View accessible accessibilityRole="header" accessibilityLabel={`${step.count} ${step.title}`}>
					<Text
						maxFontSizeMultiplier={COUNT_MAX_SCALE}
						className="w-full font-inter-bold text-[72px] text-calm"
					>
						{step.count}
					</Text>

					<View className="h-2" />

					<Text className="w-full font-inter-bold text-[26px] leading-[32.5px] text-ink">
						{step.title}
					</Text>
				</View>

				<View className="h-4" />

				<Text className="w-full font-inter text-[16px] leading-[23.2px] text-ink-muted">
					{step.body}
				</Text>

				<View className="h-7" />

				<View className="w-full gap-2">
					{Array.from({ length: step.count }, (_, i) => (
						<NamedRow
							key={`${stepIndex}-${i}`}
							ticked={ticked.includes(i)}
							onPress={() => toggle(i)}
						/>
					))}
				</View>

				<View className="min-h-6 flex-1" />
			</ScrollView>

			<View className="w-full px-6">
				<Button label={isLast ? 'Finish' : 'Next'} tone="calm" size="md" onPress={next} />

				<View className="h-2.5" />

				<Text className="w-full text-center font-inter text-[12px] leading-[17.4px] text-ink-muted">
					No timer. Go at your own pace.
				</Text>
			</View>
		</View>
	);
}
