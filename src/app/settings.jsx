import Sheet from '@/components/Sheet';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { CALM } from '@/constants/colors';
import { GUTTER } from '@/constants/layout';
import { useAiSummaries } from '@/lib/ai-summaries';
import { cancelDailyReminder } from '@/lib/reminders';
import { useAuth, useUser } from '@clerk/expo';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';

/**
 * Horizontal gutter for both the header and the scrolling body (nodes 274:3 and
 * 274:7 are both px-20). The ScrollView has to set its padding via
 * contentContainerStyle, so the header matches it from the same constant rather
 * than a parallel `px-5` class that could drift.
 */

function Row({ label, value, onPress, disabled }) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ disabled: Boolean(disabled) }}
			onPress={onPress}
			disabled={disabled}
			className="w-full flex-row items-center justify-between overflow-hidden rounded-lg border border-hairline bg-white px-4 py-4 active:opacity-80"
		>
			<Text className="font-inter-semibold text-body text-ink">{label}</Text>
			<View className="flex-row items-center gap-2">
				{value ? (
					<Text
						numberOfLines={1}
						className="font-inter text-subhead text-ink-faint"
					>
						{value}
					</Text>
				) : null}
				<Text className="font-inter-semibold text-body text-ink-faint">
					›
				</Text>
			</View>
		</Pressable>
	);
}

/**
 * The AI summaries consent from Insights. Off until they say yes; never
 * "not asked yet" here, since this screen is where they change their mind.
 */
function AiSummariesRow() {
	const { enabled, set, saving, error } = useAiSummaries();

	return (
		<View className="w-full gap-2 overflow-hidden rounded-lg border border-hairline bg-white px-4 py-4">
			<View className="w-full flex-row items-center justify-between gap-3">
				<Text className="flex-1 font-inter-semibold text-body text-ink">
					AI weekly summaries
				</Text>
				<Switch
					accessibilityLabel="AI weekly summaries"
					value={enabled === true}
					disabled={saving}
					onValueChange={set}
					trackColor={{ true: CALM }}
				/>
			</View>
			<Text className="w-full font-inter text-footnote text-ink-muted">
				When on, your check-ins and journal entries are sent to an AI model
				(Claude) to write a short summary on Insights. Your unit never sees it.
			</Text>
			{error ? (
				<Text
					accessibilityRole="alert"
					className="w-full font-inter-semibold text-footnote text-danger"
				>
					{error}
				</Text>
			) : null}
		</View>
	);
}

function Section({ title, children }) {
	return (
		<View className="w-full gap-2">
			<Text className="font-inter-semibold text-caption text-ink-faint">
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
			<Text className="font-inter-bold text-title-sm text-ink">
				Log out?
			</Text>

			<View className="h-3" />

			<Text className="w-full font-inter text-callout text-ink-muted">
				You&rsquo;ll need to log in again to see your check-ins and journal.
			</Text>

			<View className="h-5" />

			<View className="w-full gap-1 overflow-hidden rounded-lg border-2 border-calm bg-calm-surface px-4 py-4">
				<Text className="font-inter-semibold text-subhead text-ink">
					Nothing is deleted
				</Text>
				<Text className="w-full font-inter text-footnote text-ink-muted">
					Your entries stay saved. Everything will be exactly as you left it
					when you log back in.
				</Text>
			</View>

			<View className="h-5" />

			<Button
				label="Log out"
				busy={busy}
				busyLabel="Logging out…"
				onPress={onConfirm}
			/>

			<View className="h-3" />

			<Button
				label="Cancel"
				tone="secondary"
				disabled={busy}
				onPress={onCancel}
			/>
		</Sheet>
	);
}

export default function SettingsScreen() {
	const padding = useScreenPadding({ bottom: 20, bottomGap: 8 });
	const router = useRouter();
	const { isLoaded: authLoaded, isSignedIn, signOut } = useAuth();
	const { isLoaded: userLoaded, user } = useUser();

	const [confirming, setConfirming] = useState(false);
	const [busy, setBusy] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [deleteBusy, setDeleteBusy] = useState(false);
	const [deleteError, setDeleteError] = useState(null);

	if (!authLoaded || !userLoaded) return null;
	if (!isSignedIn) return <Redirect href="/login" />;

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

	async function handleDelete() {
		setDeleteBusy(true);
		setDeleteError(null);
		try {
			await user.delete();
			await cancelDailyReminder();
			router.replace('/');
		} catch (error) {
			// e.g. self-deletion is switched off in the Clerk dashboard, or Clerk
			// wants the password confirmed again first.
			setDeleteError(
				error?.errors?.[0]?.longMessage ??
					"Couldn't delete your account. Check your connection and try again.",
			);
			setDeleteBusy(false);
		}
	}

	return (
		<View className="flex-1 bg-canvas">
			<View
				className="w-full gap-2 overflow-hidden"
				style={{
					paddingTop: padding.paddingTop,
					paddingHorizontal: GUTTER,
					paddingBottom: 16,
				}}
			>
				<BackButton fallback="/home" />

				<Text className="w-full font-inter-bold text-large-title text-ink">
					Settings
				</Text>

				<Text className="w-full font-inter text-subhead text-ink-muted">
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
					paddingBottom: padding.paddingBottom,
					gap: 24,
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

				<Section title="PRIVACY">
					<AiSummariesRow />
				</Section>

				<View className="flex-1" />

				<Button
					label="Log out"
					tone="secondary"
					onPress={() => setConfirming(true)}
				/>
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
