import AuthScreen, {
	AuthFooter,
	ErrorBanner,
	SubmitButton,
	TextLink,
} from '@/components/auth/AuthScreen';
import { fieldError, formError } from '@/components/auth/errors';
import Field from '@/components/auth/Field';
import { useSignIn } from '@clerk/expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';

const FALLBACK = "Couldn't log in. Check your email and password.";

/** Shown after the log-out flow (X3, node 274:60) so the sign-out is confirmed. */
function LoggedOutBanner() {
	return (
		<View className="w-full flex-row items-center gap-2 overflow-hidden rounded-field border-1.5 border-calm bg-insight px-3.5 py-3">
			<Text className="font-inter-semibold text-[14px] text-calm">✓</Text>
			<Text className="flex-1 font-inter-medium text-[12px] leading-[16.2px] text-ink">
				You&rsquo;ve been logged out. Your data is safe.
			</Text>
		</View>
	);
}

/** Log in — "W1 Log in" (node 248:2), with its focused and error states. */
export default function LogInScreen() {
	const router = useRouter();
	const { loggedOut } = useLocalSearchParams();
	const { signIn, errors, fetchStatus } = useSignIn();

	const passwordRef = useRef(null);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	// The failed attempt, if any. Clerk's `errors` say which field it was about;
	// clearing this when they edit hides them until the next attempt.
	const [failure, setFailure] = useState(null);

	const submitting = fetchStatus === 'fetching';
	const canSubmit = Boolean(email.trim() && password);

	const shown = failure?.clerk ? errors : null;
	const emailError = fieldError(shown, 'identifier');
	const passwordError = fieldError(shown, 'password');
	const banner = failure
		? (failure.message ??
			formError(shown, ['identifier', 'password'], failure.clerk, FALLBACK))
		: null;

	function edit(setter) {
		return (value) => {
			setter(value);
			setFailure(null);
		};
	}

	async function handleLogIn() {
		if (!canSubmit || submitting) return;
		setFailure(null);

		// The signal API resolves with { error } instead of throwing.
		const { error } = await signIn.password({ identifier: email.trim(), password });
		if (error) return setFailure({ clerk: error });

		if (signIn.status !== 'complete') {
			// MFA or another factor is outstanding — no frame for that flow yet.
			return setFailure({ message: 'One more step is needed to finish logging in.' });
		}

		// finalize() promotes the completed sign-in to the active session.
		const { error: finalizeError } = await signIn.finalize();
		if (finalizeError) return setFailure({ clerk: finalizeError });

		router.replace('/home');
	}

	return (
		<AuthScreen
			banner={loggedOut ? <LoggedOutBanner /> : null}
			title="Welcome back"
			body="Pick up where you left off. Nothing you’ve written has gone anywhere."
			footer={
				<AuthFooter
					prompt="New here?"
					action="Create an account"
					onPress={() => router.push('/sign-up')}
				/>
			}
		>
			<Field
				label="Email"
				value={email}
				onChangeText={edit(setEmail)}
				error={emailError}
				placeholder="you@example.com"
				keyboardType="email-address"
				autoComplete="email"
				textContentType="emailAddress"
				returnKeyType="next"
				submitBehavior="submit"
				onSubmitEditing={() => passwordRef.current?.focus()}
			/>

			<View className="h-4.5" />

			<Field
				ref={passwordRef}
				label="Password"
				secure
				value={password}
				onChangeText={edit(setPassword)}
				error={passwordError}
				placeholder="Your password"
				autoComplete="current-password"
				textContentType="password"
				returnKeyType="go"
				onSubmitEditing={handleLogIn}
			/>

			{banner ? (
				<>
					<View className="h-2.5" />
					<ErrorBanner message={banner} />
				</>
			) : null}

			<View className="h-3.5" />

			<View className="w-full flex-row">
				<TextLink
					label="Forgot password?"
					onPress={() => router.push('/forgot-password')}
				/>
			</View>

			<View className="h-6.5" />

			<SubmitButton
				label="Log in"
				busyLabel="Logging in…"
				busy={submitting}
				disabled={!canSubmit}
				onPress={handleLogIn}
			/>
		</AuthScreen>
	);
}
