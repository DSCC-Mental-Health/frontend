import '@/global.css';

import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';

// Imported per weight, not from the package barrel: the barrel `require`s all 18
// Inter faces, and Metro cannot tree-shake asset requires (~6MB vs ~1MB bundled).
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync().catch(() => {
	// Already hidden — nothing to do.
});

export default function RootLayout() {
	const [fontsLoaded, fontError] = useFonts({
		Inter_400Regular,
		Inter_500Medium,
		Inter_600SemiBold,
		Inter_700Bold,
	});

	useEffect(() => {
		if (fontsLoaded || fontError) {
			SplashScreen.hideAsync().catch(() => {});
		}
	}, [fontsLoaded, fontError]);

	if (!fontsLoaded && !fontError) {
		return null;
	}

	return (
		<ClerkProvider
			publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
			tokenCache={tokenCache}
		>
			<SafeAreaProvider>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen
						name="check-in"
						options={{ presentation: 'modal' }}
					/>
					<Stack.Screen name="write" options={{ presentation: 'modal' }} />
				</Stack>
				{/* Onboarding sits on a light warm background in both system themes. */}
				<StatusBar style="dark" />
			</SafeAreaProvider>
		</ClerkProvider>
	);
}
