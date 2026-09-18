import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Shared frame for every onboarding step (I1–I8).
 *
 * Every frame is the same stack: progress bar, eyebrow, title, body, content,
 * footnote, flex spacer, full-width CTA. 60/44/28 padding, floored by the device
 * insets the way the other screens do it.
 */
export default function Chrome({
	progress,
	/** I1 drops the title 80px down the screen (node 16:3). */
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
			{progress === null ? null : (
				<>
					<View className="h-1.5 w-full overflow-hidden rounded-progress bg-hairline">
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

				{eyebrow ? (
					<>
						<Text className="w-full font-inter-semibold text-[12px] tracking-[0.96px] text-accent">
							{eyebrow}
						</Text>
						<View className="h-2.5" />
					</>
				) : null}

				<Text className={`w-full ${titleClassName}`}>{title}</Text>

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

				<View className="flex-1" />
			</ScrollView>

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
				<Text
					className={`font-inter-semibold text-[16px] ${
						ctaDisabled
							? 'text-ink-faint'
							: ctaTone === 'warn'
								? 'text-ink'
								: 'text-white'
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
