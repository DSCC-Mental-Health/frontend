import Button from '@/components/ui/Button';
import TextButton from '@/components/ui/TextButton';
import { Spacing } from '@/constants/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const backIcon = require('@/assets/images/back.svg');

/**
 * Shared frame for log in, sign up and password reset (W1, node 248:2).
 *
 * Scrolls, so the form and its footer stay reachable at the largest text sizes
 * and on small phones with the keyboard up. `footer` is pinned to the bottom of
 * the scroll content, like "New here? Create an account" in the frame.
 */
export default function AuthScreen({ onBack, title, body, banner, children, footer }) {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	function handleBack() {
		if (onBack) return onBack();
		if (router.canGoBack()) router.back();
		else router.replace('/');
	}

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-aura-outer"
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<ScrollView
				className="flex-1"
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					flexGrow: 1,
					paddingHorizontal: 26,
					// 54/24 from the frame edges, floored by the device insets.
					paddingTop: Math.max(54, insets.top + Spacing.two),
					paddingBottom: Math.max(24, insets.bottom + Spacing.two),
				}}
			>
				<View className="w-full flex-row">
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Go back"
						onPress={handleBack}
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

				{banner ? (
					<>
						<View className="h-3.5" />
						{banner}
					</>
				) : null}

				<View className="h-6.5" />

				<Text
					accessibilityRole="header"
					className="font-inter-bold text-[28px] leading-[35.28px] text-ink"
				>
					{title}
				</Text>

				<View className="h-2" />

				<Text className="font-inter text-[14px] leading-[20.44px] text-ink-muted">
					{body}
				</Text>

				<View className="h-7.5" />

				{children}

				<View className="min-h-6 flex-1" />

				{footer}
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

/** "New here? Create an account" style footer: a sentence plus one link. */
export function AuthFooter({ prompt, action, onPress }) {
	return (
		<View className="w-full flex-row flex-wrap items-center justify-center gap-1.25">
			<Text className="font-inter text-[13px] text-ink-muted">{prompt}</Text>
			<TextLink label={action} onPress={onPress} />
		</View>
	);
}

/** Inline orange link ("Forgot password?", "Create an account"). */
export function TextLink({ label, onPress }) {
	return <TextButton label={label} variant="linkStrong" onPress={onPress} />;
}

/** Errors that don't belong to one field, e.g. "Too many attempts". */
export function ErrorBanner({ message }) {
	if (!message) return null;
	return (
		<View
			accessibilityRole="alert"
			className="w-full gap-1 overflow-hidden rounded-banner bg-danger-surface px-3.25 py-2.75"
		>
			<Text className="w-full font-inter-semibold text-[13px] leading-[18.98px] text-danger">
				{message}
			</Text>
		</View>
	);
}

/** The full-width orange action at the bottom of each form (W1's 13px corners). */
export function SubmitButton({ label, busyLabel, busy, disabled, onPress }) {
	return (
		<Button
			label={label}
			busyLabel={busyLabel}
			busy={busy}
			disabled={disabled}
			onPress={onPress}
			radius="button"
		/>
	);
}
