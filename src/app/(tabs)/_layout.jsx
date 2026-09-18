import { useAuth, useUser } from '@clerk/expo';
import { Image } from 'expo-image';
import { Redirect, Tabs } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Each icon exports as a single-stroke SVG, so one asset per tab is enough —
// expo-image tints it for the active state.
const ICONS = {
	home: require('@/assets/images/icon-home.svg'),
	insights: require('@/assets/images/icon-insights.svg'),
	tools: require('@/assets/images/icon-tools.svg'),
	journal: require('@/assets/images/icon-journal.svg'),
	support: require('@/assets/images/icon-support.svg'),
};

const ACTIVE_ICON = '#d9682d';
const INACTIVE_ICON = '#a39990';

const TABS = [
	{ name: 'home', label: 'Home' },
	{ name: 'insights', label: 'Insights' },
	{ name: 'tools', label: 'Tools' },
	{ name: 'journal', label: 'Journal' },
	{ name: 'support', label: 'Support' },
];

/** Tab bar from node 178:93. */
function TabBar({ state, navigation }) {
	const insets = useSafeAreaInsets();

	return (
		<View
			className="w-full flex-row items-start justify-between border-t border-hairline bg-white px-1 pt-2.25"
			// The frame draws its own home indicator (178:116); the OS draws the real
			// one, so we pad for it instead of rendering a second bar.
			style={{ paddingBottom: Math.max(5, insets.bottom) }}
		>
			{state.routes.map((route, index) => {
				const tab = TABS.find((t) => t.name === route.name);
				if (!tab) return null;

				const focused = state.index === index;

				return (
					<Pressable
						key={route.key}
						accessibilityRole="button"
						accessibilityState={{ selected: focused }}
						accessibilityLabel={tab.label}
						onPress={() => {
							const event = navigation.emit({
								type: 'tabPress',
								target: route.key,
								canPreventDefault: true,
							});
							if (!focused && !event.defaultPrevented)
								navigation.navigate(route.name);
						}}
						className="flex-col items-center gap-1.25 px-1.5 active:opacity-60"
					>
						<Image
							source={ICONS[tab.name]}
							style={{ width: 22, height: 22 }}
							contentFit="contain"
							tintColor={focused ? ACTIVE_ICON : INACTIVE_ICON}
							accessibilityIgnoresInvertColors
						/>
						<Text
							className={
								focused
									? 'font-inter-semibold text-[10px] text-ink'
									: 'font-inter-medium text-[10px] text-ink-muted'
							}
						>
							{tab.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

export default function TabsLayout() {
	const { isLoaded, isSignedIn } = useAuth();
	const { isLoaded: userLoaded, user } = useUser();

	// Wait for Clerk to restore the cached session — redirecting before it loads
	// would bounce signed-in users to login on every cold start.
	if (!isLoaded || !userLoaded) return null;
	if (!isSignedIn) return <Redirect href="/login" />;

	// Single source of truth for the first-run flow: login and the welcome screen
	// both send people to /home, and this sends them on to onboarding if they
	// have not finished it.
	if (!user?.unsafeMetadata?.onboardingComplete) {
		return <Redirect href="/onboarding" />;
	}

	return (
		<Tabs
			screenOptions={{ headerShown: false }}
			tabBar={(props) => <TabBar {...props} />}
		>
			{TABS.map((tab) => (
				<Tabs.Screen
					key={tab.name}
					name={tab.name}
					options={{ title: tab.label }}
				/>
			))}
		</Tabs>
	);
}
