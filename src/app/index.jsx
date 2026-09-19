import Button from '@/components/ui/Button';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@clerk/expo';
import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const breathingRings = require('@/assets/images/breathing-rings.svg');

// nativewind cannot compile a radial-gradient into a utility, so the aura
// stays an inline RN style. Base colour mirrors `aura-outer` in tailwind.config.js.
const AURA =
	'radial-gradient(ellipse 40% 47.62% at 49.6% 76.19%, ' +
	'#f9d8aa 0%, #fcecd7 45%, #fbf6ec 100%)';

/**
 * Welcome screen — "V1 Login — warm aura" (Figma node 242:2).
 *
 * "Log in" pushes /login, where the email + password form lives; the second
 * button opens the privacy explainer. Scrolls so both stay reachable at the
 * largest text sizes.
 */
export default function WelcomeScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { isLoaded, isSignedIn } = useAuth();

	// Returning users go straight to the dashboard. Waiting on isLoaded avoids a
	// flash of this screen while Clerk restores the cached session.
	if (isLoaded && isSignedIn) {
		return <Redirect href="/home" />;
	}

	function handleLogIn() {
		router.push('/login');
	}

	function handleOpenPrivacy() {
		router.push('/privacy');
	}

	return (
		<View className="flex-1 bg-aura-outer" style={{ experimental_backgroundImage: AURA }}>
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					flexGrow: 1,
					paddingHorizontal: 30,
					paddingTop: Math.max(90, insets.top + Spacing.four),
					paddingBottom: Math.max(46, insets.bottom + Spacing.three),
				}}
			>
				<View className="flex-1" />

				<View className="items-center justify-center">
					<Image
						source={breathingRings}
						style={{ width: 168, height: 168 }}
						contentFit="contain"
						accessibilityIgnoresInvertColors
					/>
				</View>

				<View className="h-8.5" />

				<Text className="text-center font-inter-bold text-[38px] leading-[44.84px] text-ink">
					Steady
				</Text>

				<View className="h-3" />

				<Text className="text-center font-inter text-[16px] leading-[23.68px] text-ink-muted">
					A quieter way to keep track of how you&rsquo;re doing through BMT.
				</Text>

				<View className="shrink grow basis-29" />

				<View className="gap-2 overflow-hidden rounded-control bg-surface px-4 py-3.5">
					<Text className="text-center font-inter-semibold text-[13px] leading-[18.98px] text-ink">
						Your check-ins stay yours
					</Text>
					<Text className="text-center font-inter text-[12px] leading-[17.76px] text-ink-muted">
						Your account only confirms you&rsquo;re an NSF. Your commanders never
						see what you write.
					</Text>
				</View>

				<View className="h-4" />

				<Button label="Log in" onPress={handleLogIn} />

				<View className="h-2.75" />

				<Button
					label="How Steady handles your data"
					tone="secondary"
					role="link"
					onPress={handleOpenPrivacy}
				/>

				<View className="h-4.5" />

				<Text className="text-center font-inter text-[11px] leading-[16.06px] text-ink-faint">
					Hosted in Singapore · PDPA compliant
				</Text>
			</ScrollView>
		</View>
	);
}
