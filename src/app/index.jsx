import { Spacing } from '@/constants/theme';
import { useAuth } from '@clerk/expo';
import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
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
 * "Log in" pushes /login, where the email + password form lives. The privacy
 * explainer is not wired up yet.
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
		// TODO: route to the data-handling explainer once that screen exists.
	}

	return (
		<View
			className="flex-1 bg-aura-outer px-7.5"
			style={{
				experimental_backgroundImage: AURA,
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

			<Pressable
				accessibilityRole="button"
				accessibilityLabel="Log in"
				onPress={handleLogIn}
				className="items-center justify-center overflow-hidden rounded-control bg-accent py-4 active:opacity-85"
			>
				<Text className="font-inter-semibold text-[16px] text-white">
					Log in
				</Text>
			</Pressable>

			<View className="h-2.75" />

			<Pressable
				accessibilityRole="button"
				onPress={handleOpenPrivacy}
				className="items-center justify-center overflow-hidden rounded-control border border-hairline bg-white py-4 active:opacity-85"
			>
				<Text className="font-inter-semibold text-[16px] text-ink">
					How Steady handles your data
				</Text>
			</Pressable>

			<View className="h-4.5" />

			<Text className="text-center font-inter text-[11px] leading-[16.06px] text-ink-faint">
				Hosted in Singapore · PDPA compliant
			</Text>
		</View>
	);
}
