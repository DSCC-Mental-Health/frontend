import { Spacing } from '@/constants/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const backIcon = require('@/assets/images/back.svg');

/**
 * Placeholder — there is no Figma frame for this screen yet. It exists so the
 * link on the log in screen navigates somewhere instead of dead-ending.
 */
export default function ForgotPasswordScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	return (
		<View
			className="flex-1 bg-aura-outer px-6.5"
			style={{
				paddingTop: Math.max(54, insets.top + Spacing.two),
				paddingBottom: Math.max(24, insets.bottom + Spacing.two),
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

			<Text className="font-inter-bold text-[28px] leading-[35.28px] text-ink">
				Reset your password
			</Text>

			<View className="h-2" />

			<Text className="font-inter text-[14px] leading-[20.44px] text-ink-muted">
				Enter the email you signed up with and we'll send you a reset link.
			</Text>
		</View>
	);
}
