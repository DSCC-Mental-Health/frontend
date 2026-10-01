import Button from '@/components/ui/Button';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { GUTTER } from '@/constants/layout';
import { useAuth } from '@clerk/expo';
import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

const breathingRings = require('@/assets/images/breathing-rings.svg');

// nativewind cannot compile a radial-gradient into a utility, so the aura
// stays an inline RN style. It fades out to `canvas` in src/theme/palette.js.
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
	const padding = useScreenPadding({
		top: 90,
		topGap: 24,
		bottom: 48,
		bottomGap: 16,
	});
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

	return (
		<View
			className="flex-1 bg-canvas"
			style={{ experimental_backgroundImage: AURA }}
		>
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					flexGrow: 1,
					paddingHorizontal: GUTTER,
					...padding,
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

				<View className="h-9" />

				<Text className="text-center font-inter-bold text-display text-ink">
					Steady
				</Text>

				<View className="h-3" />

				<Text className="text-center font-inter text-body-lg text-ink-muted">
					A way to keep track of how you&rsquo;re doing through BMT.
				</Text>

				<View className="shrink grow basis-28" />

				<View className="gap-2 overflow-hidden rounded-lg bg-white/65 px-4 py-4">
					<Text className="text-center font-inter-semibold text-subhead text-ink">
						Your check-ins stay yours
					</Text>
					<Text className="text-center font-inter text-footnote text-ink-muted">
						Your account only confirms you&rsquo;re an NSF. Your commanders
						never see what you write.
					</Text>
				</View>

				<View className="h-4" />

				<Button label="Log in" onPress={handleLogIn} />

				<View className="h-3" />
				<View className="h-5" />

				<Text className="text-center font-inter text-caption text-ink-faint">
					Footer
				</Text>
			</ScrollView>
		</View>
	);
}
