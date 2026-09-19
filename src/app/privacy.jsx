import PrivacyPanels from '@/components/PrivacyPanels';
import { Spacing } from '@/constants/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const backIcon = require('@/assets/images/back.svg');

/**
 * "How Steady handles your data", opened from the welcome screen before sign-in.
 *
 * No frame of its own: it's the same three panels as onboarding I2 (node 16:12),
 * so people can read who sees what before they make an account.
 */
export default function PrivacyScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	return (
		<ScrollView
			className="flex-1 bg-aura-outer"
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{
				paddingHorizontal: 28,
				paddingTop: Math.max(54, insets.top + Spacing.two),
				paddingBottom: Math.max(32, insets.bottom + Spacing.three),
			}}
		>
			<View className="w-full flex-row">
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Go back"
					onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
					hitSlop={12}
					className="active:opacity-60"
				>
					<Image
						source={backIcon}
						style={{ width: 24, height: 24 }}
						contentFit="contain"
						accessibilityIgnoresInvertColors
					/>
				</Pressable>
			</View>

			<View className="h-6.5" />

			<Text
				accessibilityRole="header"
				className="w-full font-inter-bold text-[26px] leading-[32.5px] text-ink"
			>
				Who can see what
			</Text>

			<View className="h-2.5" />

			<Text className="w-full font-inter text-[15px] leading-[21px] text-ink-muted">
				What Steady keeps, what stays yours, and the little your unit ever sees.
			</Text>

			<View className="h-5.5" />

			<PrivacyPanels />

			<View className="h-4.5" />

			<Text className="w-full text-center font-inter text-[11px] leading-[16.06px] text-ink-faint">
				Hosted in Singapore · PDPA compliant
			</Text>
		</ScrollView>
	);
}
