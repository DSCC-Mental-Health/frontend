import BackButton from '@/components/ui/BackButton';
import TextButton from '@/components/ui/TextButton';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { GUTTER } from '@/constants/layout';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

/**
 * Shared frame for log in, sign up and password reset (W1, node 248:2).
 *
 * Scrolls, so the form stays reachable at the largest text sizes and on small
 * phones with the keyboard up.
 */
export default function AuthScreen({ onBack, title, body, banner, children }) {
	// 54/24 from the frame edges, floored by the device insets.
	const padding = useScreenPadding({ bottom: 24, bottomGap: 8 });
	return (
		<KeyboardAvoidingView
			className="flex-1 bg-canvas"
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<ScrollView
				className="flex-1"
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ flexGrow: 1, paddingHorizontal: GUTTER, ...padding }}
			>
				<BackButton onPress={onBack} />

				{banner ? (
					<>
						<View className="h-4" />
						{banner}
					</>
				) : null}

				<View className="h-7" />

				<Text
					accessibilityRole="header"
					className="font-inter-bold text-large-title text-ink"
				>
					{title}
				</Text>

				<View className="h-2" />

				<Text className="font-inter text-callout text-ink-muted">
					{body}
				</Text>

				<View className="h-8" />

				{children}

				<View className="min-h-6 flex-1" />
			</ScrollView>
		</KeyboardAvoidingView>
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
			className="w-full gap-1 overflow-hidden rounded-md bg-danger-surface px-3 py-3"
		>
			<Text className="w-full font-inter-semibold text-subhead text-danger">
				{message}
			</Text>
		</View>
	);
}
