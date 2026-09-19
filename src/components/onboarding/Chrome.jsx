import { Image } from 'expo-image';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const breathingRings = require('@/assets/images/breathing-rings.svg');

/**
 * Shared frame for every onboarding step (I1–I8).
 *
 * Every frame is the same stack: back link, progress bar, eyebrow, title, body,
 * content, footnote, flex spacer, full-width CTA. 60/44/28 padding, floored by
 * the device insets the way the other screens do it.
 */
export default function Chrome({
	progress,
	/** Omitted on I1. Onboarding is one route, so this is the only way back on iOS. */
	onBack,
	/** Size of the welcome screen's breathing rings, shown above the title. */
	rings,
	/** I1 drops the title down the screen (node 16:3). */
	topSpace = 0,
	eyebrow,
	title,
	titleClassName = 'font-inter-bold text-[26px] leading-[32.5px] text-ink',
	body,
	footnote,
	/** Gap between the body and the content block; 22px on every frame but I1. */
	contentSpace = 22,
	cta,
	ctaTone = 'accent',
	ctaDisabled = false,
	/** Shown above the button when the step's action failed. */
	ctaError,
	/** I1 only: a line under the button rather than above it (node 16:11). */
	ctaFootnote,
	onPress,
	children,
}) {
	const insets = useSafeAreaInsets();

	return (
		<View
			className="flex-1 bg-aura-outer px-7"
			style={{
				paddingTop: Math.max(60, insets.top + 12),
				paddingBottom: Math.max(44, insets.bottom + 12),
			}}
		>
			{onBack ? (
				<>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Back to the previous step"
						onPress={onBack}
						hitSlop={14}
						className="self-start active:opacity-60"
					>
						<Text className="font-inter-medium text-[14px] text-ink-muted">Back</Text>
					</Pressable>
					<View className="h-3.5" />
				</>
			) : null}

			{progress === null ? null : (
				<>
					<View
						accessibilityRole="progressbar"
						accessibilityLabel="Setup progress"
						accessibilityValue={{ min: 0, max: 100, now: progress }}
						className="h-1.5 w-full overflow-hidden rounded-progress bg-hairline"
					>
						<View
							className="h-1.5 rounded-progress bg-accent"
							style={{ width: `${progress}%` }}
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
				{topSpace ? <View style={{ height: topSpace }} /> : null}

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

				{eyebrow ? (
					<>
						<Text className="w-full font-inter-semibold text-[12px] tracking-[0.96px] text-accent-text">
							{eyebrow}
						</Text>
						<View className="h-2.5" />
					</>
				) : null}

				<Text accessibilityRole="header" className={`w-full ${titleClassName}`}>
					{title}
				</Text>

				{body ? (
					<>
						<View className="h-2.5" />
						<Text className="w-full font-inter text-[15px] leading-[21px] text-ink-muted">
							{body}
						</Text>
					</>
				) : null}

				{children ? (
					<>
						<View style={{ height: contentSpace }} />
						{children}
					</>
				) : null}

				{footnote ? (
					<>
						<View className="h-4" />
						<Text className="w-full font-inter-medium text-[13px] leading-[18.2px] text-ink">
							{footnote}
						</Text>
					</>
				) : null}

				<View className="min-h-4 flex-1" />
			</ScrollView>

			{ctaError ? (
				<>
					<Text
						accessibilityRole="alert"
						className="w-full text-center font-inter-semibold text-[13px] leading-[18.2px] text-danger"
					>
						{ctaError}
					</Text>
					<View className="h-3" />
				</>
			) : null}

			<Pressable
				accessibilityRole="button"
				accessibilityState={{ disabled: ctaDisabled }}
				disabled={ctaDisabled}
				onPress={onPress}
				className={`w-full items-center justify-center overflow-hidden rounded-control py-4 ${
					ctaDisabled
						? 'bg-hairline'
						: ctaTone === 'warn'
							? 'bg-warn active:opacity-85'
							: 'bg-accent active:opacity-85'
				}`}
			>
				{/* Bold, not semibold: white on the brand orange is 3.5:1, which only
				    passes the contrast minimum as bold text. */}
				<Text
					className={`text-[16px] ${
						ctaDisabled
							? 'font-inter-semibold text-ink-faint'
							: ctaTone === 'warn'
								? 'font-inter-semibold text-ink'
								: 'font-inter-bold text-white'
					}`}
				>
					{cta}
				</Text>
			</Pressable>

			{ctaFootnote ? (
				<>
					<View className="h-3.5" />
					<Text className="w-full text-center font-inter text-[12px] leading-[16.8px] text-ink-muted">
						{ctaFootnote}
					</Text>
				</>
			) : null}
		</View>
	);
}
