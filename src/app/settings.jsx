import { useAuth, useUser } from '@clerk/expo';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import Sheet from '@/components/Sheet';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Horizontal gutter for both the header and the scrolling body (nodes 274:3 and
 * 274:7 are both px-20). The ScrollView has to set its padding via
 * contentContainerStyle, so the header matches it from the same constant rather
 * than a parallel `px-5` class that could drift.
 */
const GUTTER = 20;

function Row({ label, value, onPress, disabled }) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ disabled: Boolean(disabled) }}
			onPress={onPress}
			disabled={disabled}
			className="w-full flex-row items-center justify-between overflow-hidden rounded-control border border-hairline bg-white px-4 py-3.75 active:opacity-80"
		>
			<Text className="font-inter-semibold text-[15px] text-ink">{label}</Text>
			<View className="flex-row items-center gap-1.5">
				{value ? (
					<Text
						numberOfLines={1}
						className="font-inter text-[13px] text-ink-faint"
					>
						{value}
					</Text>
				) : null}
				<Text className="font-inter-semibold text-[15px] text-ink-faint">
					›
				</Text>
			</View>
		</Pressable>
	);
}

function Section({ title, children }) {
	return (
		<View className="w-full gap-2">
			<Text className="font-inter-semibold text-[11px] text-ink-faint">
				{title}
			</Text>
			{children}
		</View>
	);
}

/**
 * X2 Log out confirm (node 274:44) — a bottom sheet over a scrim. It belongs to
 * this screen rather than a route of its own.
 */
function LogOutSheet({ visible, busy, onConfirm, onCancel }) {
	return (
		<Sheet visible={visible} onClose={onCancel} dismissable={!busy}>
			<Text className="font-inter-bold text-[20px] leading-[29px] text-ink">
				Log out?
			</Text>

			<View className="h-2.5" />

			<Text className="w-full font-inter text-[14px] leading-[20.3px] text-ink-muted">
				You&rsquo;ll need to log in again to see your check-ins and journal.
			</Text>

			<View className="h-4.5" />

			<View className="w-full gap-1 overflow-hidden rounded-control border-1.5 border-calm bg-insight px-4 py-3.5">
				<Text className="font-inter-semibold text-[13px] text-ink">
					Nothing is deleted
				</Text>
				<Text className="w-full font-inter text-[12px] leading-[17.4px] text-ink-muted">
					Your entries stay saved. Everything will be exactly as you left it
					when you log back in.
				</Text>
			</View>

			<View className="h-5" />

			<Pressable
				accessibilityRole="button"
				accessibilityState={{ disabled: busy, busy }}
				disabled={busy}
				onPress={onConfirm}
				className={`w-full items-center justify-center overflow-hidden rounded-control p-4 ${
					busy ? 'bg-hairline' : 'bg-accent active:opacity-85'
				}`}
			>
				<Text
					className={`font-inter-semibold text-[16px] ${
						busy ? 'text-ink-faint' : 'text-white'
					}`}
				>
					{busy ? 'Logging out…' : 'Log out'}
				</Text>
			</Pressable>

			<View className="h-2.5" />

			<Pressable
				accessibilityRole="button"
				disabled={busy}
				onPress={onCancel}
				className="w-full items-center justify-center overflow-hidden rounded-control border border-hairline bg-white p-4 active:opacity-80"
			>
				<Text className="font-inter-semibold text-[16px] text-ink">
					Cancel
				</Text>
			</Pressable>
		</Sheet>
	);
}

export default function SettingsScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { isLoaded: authLoaded, isSignedIn, signOut } = useAuth();
	const { isLoaded: userLoaded, user } = useUser();

	const [confirming, setConfirming] = useState(false);
	const [busy, setBusy] = useState(false);

	if (!authLoaded || !userLoaded) return null;
	if (!isSignedIn) return <Redirect href="/login" />;

	function handleBack() {
		if (router.canGoBack()) router.back();
		else router.replace('/home');
	}

	async function handleLogOut() {
		setBusy(true);
		try {
			// Await before navigating so the session is actually gone by the time
			// the login screen mounts and its guards run.
			await signOut();
			setConfirming(false);
			router.replace('/login?loggedOut=1');
		} catch {
			// Keep them on the sheet with the button live rather than stranding
			// them in a half-signed-out state.
			setBusy(false);
		}
	}

	return (
		<View className="flex-1 bg-aura-outer">
			<View
				className="w-full gap-2 overflow-hidden"
				style={{
					paddingTop: Math.max(56, insets.top + 12),
					paddingHorizontal: GUTTER,
					paddingBottom: 16,
				}}
			>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Go back"
					onPress={handleBack}
					hitSlop={12}
					className="self-start active:opacity-60"
				>
					<Text className="font-inter-semibold text-[20px] text-ink">←</Text>
				</Pressable>

				<Text className="w-full font-inter-bold text-[26px] text-ink">
					Settings
				</Text>

				<Text className="w-full font-inter text-[13px] leading-[18.2px] text-ink-muted">
					Your account and how Steady works for you.
				</Text>
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					flexGrow: 1,
					paddingHorizontal: GUTTER,
					paddingTop: 4,
					paddingBottom: Math.max(20, insets.bottom + 8),
					gap: 22,
				}}
			>
				{/* Only "Log out" is wired — the rest have no frames yet. */}
				<Section title="ACCOUNT">
					<Row
						label="Email"
						value={user?.primaryEmailAddress?.emailAddress}
						onPress={() => {}}
					/>
					<Row label="Change password" onPress={() => {}} />
				</Section>

				<View className="flex-1" />

				<Pressable
					accessibilityRole="button"
					onPress={() => setConfirming(true)}
					className="w-full items-center justify-center overflow-hidden rounded-control border border-hairline bg-white px-4 py-3.75 active:opacity-80"
				>
					<Text className="font-inter-semibold text-[15px] text-ink">
						Log out
					</Text>
				</Pressable>
			</ScrollView>

			<LogOutSheet
				visible={confirming}
				busy={busy}
				onConfirm={handleLogOut}
				onCancel={() => setConfirming(false)}
			/>
		</View>
	);
}
