import { Spacing } from '@/constants/theme';
import { useSignIn } from '@clerk/expo';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	Text,
	TextInput,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const backIcon = require('@/assets/images/back.svg');
const eyeIcon = require('@/assets/images/eye-toggle.svg');

export default function LogInScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	// Set by the log-out flow (X3, node 274:60) so this screen can confirm the
	// sign-out actually happened. Everything below the banner is the same W1 frame.
	const { loggedOut } = useLocalSearchParams();

	const { signIn, fetchStatus } = useSignIn();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [focused, setFocused] = useState(null);
	const [error, setError] = useState(null);

	const submitting = fetchStatus === 'fetching';
	const canSubmit = Boolean(email.trim() && password && !submitting);

	/**
	 * 1px hairline at rest; 1.6px accent while focused (248:60) and 1.6px danger
	 * when the attempt was rejected (248:90).
	 */
	function fieldBorder(name) {
		if (error && name === 'password') return 'border-1.6 border-danger';
		if (focused === name) return 'border-1.6 border-accent';
		return 'border border-hairline';
	}

	function handleBack() {
		if (router.canGoBack()) router.back();
		else router.replace('/');
	}

	/**
	 * Clerk marks `message` as developer-facing and `longMessage` as the copy that
	 * is safe to show a user, so the banner leads with `longMessage`.
	 */
	function toBanner(clerkError) {
		return {
			title:
				clerkError?.longMessage ??
				'We could not sign you in. Check your details and try again.',
		};
	}

	async function handleLogIn() {
		if (!canSubmit) return;

		setError(null);

		// The future API resolves with { error } instead of throwing.
		const { error: passwordError } = await signIn.password({
			identifier: email.trim(),
			password,
		});

		if (passwordError) {
			setError(toBanner(passwordError));
			return;
		}

		if (signIn.status !== 'complete') {
			// MFA or another factor is outstanding — no frame for that flow yet.
			setError({ title: 'One more step is needed to finish signing in.' });
			return;
		}

		// finalize() promotes the completed sign-in to the active session; it
		// replaces the old setActive({ session }) call.
		const { error: finalizeError } = await signIn.finalize();

		if (finalizeError) {
			setError(toBanner(finalizeError));
			return;
		}

		router.replace('/home');
	}

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-aura-outer"
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<View
				className="flex-1 px-6.5"
				style={{
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

				{loggedOut ? (
					<>
						<View className="w-full flex-row items-center gap-2 overflow-hidden rounded-field border-1.5 border-calm bg-insight px-3.5 py-3">
							<Text className="font-inter-semibold text-[14px] text-calm">
								✓
							</Text>
							<Text className="flex-1 font-inter-medium text-[12px] leading-[16.2px] text-ink">
								You&rsquo;ve been logged out. Your data is safe.
							</Text>
						</View>
						<View className="h-3.5" />
					</>
				) : null}

				<View className="h-6.5" />

				<Text className="font-inter-bold text-[28px] leading-[35.28px] text-ink">
					Welcome back
				</Text>

				<View className="h-2" />

				<Text className="font-inter text-[14px] leading-[20.44px] text-ink-muted">
					Pick up where you left off. Nothing you&rsquo;ve written has gone
					anywhere.
				</Text>

				<View className="h-7.5" />

				<View className="w-full gap-2">
					<Text className="w-full font-inter-semibold text-[13px] text-ink">
						Email
					</Text>
					<View
						className={`w-full flex-row items-center rounded-field bg-white p-3.75 ${fieldBorder('email')}`}
					>
						<TextInput
							value={email}
							onChangeText={setEmail}
							onFocus={() => setFocused('email')}
							onBlur={() => setFocused(null)}
							placeholder="you@example.com"
							placeholderTextColor={'#a39990'}
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
							autoComplete="email"
							textContentType="emailAddress"
							returnKeyType="next"
							className="flex-1 p-0 font-inter text-[15px] text-ink"
						/>
					</View>
				</View>

				<View className="h-4.5" />

				<View className="w-full gap-2">
					<Text className="w-full font-inter-semibold text-[13px] text-ink">
						Password
					</Text>
					<View
						className={`w-full flex-row items-center gap-2.5 rounded-field bg-white p-3.75 ${fieldBorder('password')}`}
					>
						<TextInput
							value={password}
							onChangeText={setPassword}
							onFocus={() => setFocused('password')}
							onBlur={() => setFocused(null)}
							placeholder="Your password"
							placeholderTextColor={'#a39990'}
							secureTextEntry={!showPassword}
							autoCapitalize="none"
							autoCorrect={false}
							autoComplete="current-password"
							textContentType="password"
							returnKeyType="go"
							onSubmitEditing={handleLogIn}
							className="flex-1 p-0 font-inter text-[15px] text-ink"
						/>
						<Pressable
							accessibilityRole="button"
							accessibilityLabel={
								showPassword ? 'Hide password' : 'Show password'
							}
							onPress={() => setShowPassword((shown) => !shown)}
							hitSlop={10}
							className="active:opacity-60"
						>
							<Image
								source={eyeIcon}
								style={{
									width: 22,
									height: 22,
									opacity: showPassword ? 1 : 0.55,
								}}
								contentFit="contain"
								accessibilityIgnoresInvertColors
							/>
						</Pressable>
					</View>
				</View>

				{error ? (
					<>
						<View className="h-2.5" />
						<View
							accessibilityRole="alert"
							className="w-full gap-1 overflow-hidden rounded-banner bg-danger-surface px-3.25 py-2.75"
						>
							<Text className="w-full font-inter-semibold text-[13px] leading-[18.98px] text-danger">
								{error.title}
							</Text>
						</View>
					</>
				) : null}

				<View className="h-3.5" />

				<View className="w-full flex-row">
					<Pressable
						accessibilityRole="button"
						onPress={() => router.push('/forgot-password')}
						hitSlop={8}
						className="active:opacity-60"
					>
						<Text className="font-inter-semibold text-[13px] text-accent">
							Forgot password?
						</Text>
					</Pressable>
				</View>

				<View className="h-6.5" />

				<Pressable
					accessibilityRole="button"
					accessibilityState={{ disabled: !canSubmit, busy: submitting }}
					disabled={!canSubmit}
					onPress={handleLogIn}
					className={`w-full items-center justify-center overflow-hidden rounded-button py-4 ${
						canSubmit ? 'bg-accent active:opacity-85' : 'bg-hairline'
					}`}
				>
					<Text
						className={`font-inter-semibold text-[16px] ${
							canSubmit ? 'text-white' : 'text-ink-faint'
						}`}
					>
						{submitting ? 'Logging in…' : 'Log in'}
					</Text>
				</Pressable>

				<View className="flex-1" />

				<View className="w-full flex-row items-center justify-center gap-1.25">
					<Text className="font-inter text-[13px] text-ink-muted">
						New here?
					</Text>
					<Pressable
						accessibilityRole="button"
						onPress={() => router.push('/sign-up')}
						hitSlop={8}
						className="active:opacity-60"
					>
						<Text className="font-inter-semibold text-[13px] text-accent">
							Create an account
						</Text>
					</Pressable>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}
