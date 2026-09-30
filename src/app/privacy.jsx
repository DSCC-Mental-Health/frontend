import PrivacyPanels from '@/components/PrivacyPanels';
import BackButton from '@/components/ui/BackButton';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { GUTTER } from '@/constants/layout';
import { ScrollView, Text, View } from 'react-native';

/**
 * "How Steady handles your data", opened from the welcome screen before sign-in.
 *
 * No frame of its own: it's the same three panels as onboarding I2 (node 16:12),
 * so people can read who sees what before they make an account.
 */
export default function PrivacyScreen() {
	const padding = useScreenPadding({ bottom: 32, bottomGap: 16 });

	return (
		<ScrollView
			className="flex-1 bg-aura-outer"
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{ paddingHorizontal: GUTTER, ...padding }}
		>
			<BackButton />

			<View className="h-7" />

			<Text
				accessibilityRole="header"
				className="w-full font-inter-bold text-large-title text-ink"
			>
				Who can see what
			</Text>

			<View className="h-3" />

			<Text className="w-full font-inter text-body text-ink-muted">
				What Steady keeps, what stays yours, and the little your unit ever sees.
			</Text>

			<View className="h-6" />

			<PrivacyPanels />

			<View className="h-5" />

			<Text className="w-full text-center font-inter text-caption text-ink-faint">
				Hosted in Singapore · PDPA compliant
			</Text>
		</ScrollView>
	);
}
