import Button from '@/components/ui/Button';
import TextButton from '@/components/ui/TextButton';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { Image } from 'expo-image';
import { ScrollView, Text, View } from 'react-native';

const breathingRings = require('@/assets/images/breathing-rings.svg');

/**
 * Title sizes. `large` is I1, which also drops the title down the screen and
 * sits closer to its content.
 */
const SIZES = {
	default: { title: 'font-inter-bold text-large-title', top: 0, gap: 24 },
	large: { title: 'font-inter-bold text-display', top: 24, gap: 16 },
};

/**
 * Shared frame for every onboarding step (I1–I8).
 *
 * Every frame is the same stack: back link, progress bar, eyebrow, title, body,
 * content, footnote, flex spacer, full-width CTA. The wording comes from the
 * step itself (src/data/onboarding.js); a step only passes what makes it
 * different. 60/44/28 padding, floored by the device insets.
 */
export default function Chrome({
	/** The entry from STEPS: progress, eyebrow, title, body, footnote, cta. */
	step,
	size = 'default',
	/** Size of the breathing rings above the title (I1, I8). */
	rings,
	/** Omitted on I1. Onboarding is one route, so this is the only way back on iOS. */
	onBack,
	onNext,
	/** While the step's action runs — the button shows `busyLabel` and locks. */
	busy = false,
	busyLabel,
	/** I8's amber "Enter Steady". */
	tone,
	/** Overrides the step's own footnote (I8 reports the reminder result). */
	footnote,
	/** Shown above the button when the step's action failed. */
	error,
	/** I1 only: a line under the button rather than above it (node 16:11). */
	ctaFootnote,
	children,
}) {
	const padding = useScreenPadding({ bottom: 44, bottomGap: 12 });
	const look = SIZES[size];
	const note = footnote ?? step.footnote;

	return (
		<View className="flex-1 bg-canvas px-5" style={padding}>
			{onBack ? (
				<>
					<TextButton
						label="Back"
						accessibilityLabel="Back to the previous step"
						onPress={onBack}
						className="self-start"
					/>
					<View className="h-4" />
				</>
			) : null}

			{step.progress === null ? null : (
				<>
					<View
						accessibilityRole="progressbar"
						accessibilityLabel="Setup progress"
						accessibilityValue={{ min: 0, max: 100, now: step.progress }}
						className="h-1.5 w-full overflow-hidden rounded-full bg-hairline"
					>
						<View
							className="h-1.5 rounded-full bg-accent"
							style={{ width: `${step.progress}%` }}
						/>
					</View>
					<View className="h-7" />
				</>
			)}

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ flexGrow: 1 }}
			>
				{look.top ? <View style={{ height: look.top }} /> : null}

				{rings ? (
					<>
						<Image
							source={breathingRings}
							style={{ width: rings, height: rings }}
							contentFit="contain"
							accessibilityIgnoresInvertColors
						/>
						<View className="h-6" />
					</>
				) : null}

				{step.eyebrow ? (
					<>
						<Text className="w-full font-inter-semibold text-footnote tracking-eyebrow text-accent-strong">
							{step.eyebrow}
						</Text>
						<View className="h-3" />
					</>
				) : null}

				<Text accessibilityRole="header" className={`w-full ${look.title} text-ink`}>
					{step.title}
				</Text>

				{step.body ? (
					<>
						<View className="h-3" />
						<Text className="w-full font-inter text-body text-ink-muted">
							{step.body}
						</Text>
					</>
				) : null}

				{children ? (
					<>
						<View style={{ height: look.gap }} />
						{children}
					</>
				) : null}

				{note ? (
					<>
						<View className="h-4" />
						<Text className="w-full font-inter-medium text-subhead text-ink">
							{note}
						</Text>
					</>
				) : null}

				<View className="min-h-4 flex-1" />
			</ScrollView>

			{error ? (
				<>
					<Text
						accessibilityRole="alert"
						className="w-full text-center font-inter-semibold text-subhead text-danger"
					>
						{error}
					</Text>
					<View className="h-3" />
				</>
			) : null}

			<Button
				label={step.cta}
				tone={tone}
				busy={busy}
				busyLabel={busyLabel}
				onPress={onNext}
			/>

			{ctaFootnote ? (
				<>
					<View className="h-4" />
					<Text className="w-full text-center font-inter text-footnote text-ink-muted">
						{ctaFootnote}
					</Text>
				</>
			) : null}
		</View>
	);
}
