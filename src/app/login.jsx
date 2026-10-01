import AuthScreen, {
	ErrorBanner,
	TextLink,
} from '@/components/auth/AuthScreen';
import Field from '@/components/auth/Field';
import useAuthErrors from '@/components/auth/useAuthErrors';
import Button from '@/components/ui/Button';
import { useSignIn } from '@clerk/expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';

const FALLBACK = "Couldn't log in. Check your email and password.";

function LoggedOutBanner() {
	return (
		<View className="w-full flex-row items-center gap-2 overflow-hidden rounded-md border-2 border-calm bg-calm-surface px-4 py-3">
			<Text className="font-inter-semibold text-callout text-calm">✓</Text>
			<Text className="flex-1 font-inter-medium text-footnote text-ink">
				You&rsquo;ve been logged out. Your data is safe.
			</Text>
		</View>
	);
}

export default function LogInScreen() {
	const router = useRouter();
	const { loggedOut } = useLocalSearchParams();
	const { signIn, errors, fetchStatus } = useSignIn();

	const passwordRef = useRef(null);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const attempt = useAuthErrors(errors, FALLBACK);

	const submitting = fetchStatus === 'fetching';
	const canSubmit = Boolean(email.trim() && password);
	const banner = attempt.banner(['identifier', 'password']);

	async function handleLogIn() {
		if (!canSubmit || submitting) return;
		attempt.clear();

		// The signal API resolves with { error } instead of throwing.
		const { error } = await signIn.password({
			identifier: email.trim(),
			password,
		});
		if (error) return attempt.fail({ clerk: error });

		if (signIn.status !== 'complete') {
			// MFA or another factor is outstanding — no frame for that flow yet.
			return attempt.fail({
				message: 'One more step is needed to finish logging in.',
			});
		}

		// finalize() promotes the completed sign-in to the active session.
		const { error: finalizeError } = await signIn.finalize();
		if (finalizeError) return attempt.fail({ clerk: finalizeError });

		router.replace('/home');
	}

	return (
		<AuthScreen
			banner={loggedOut ? <LoggedOutBanner /> : null}
			title="Welcome back"
			body="Pick up where you left off. Nothing you’ve written has gone anywhere."
		>
			<Field
				label="Email"
				value={email}
				onChangeText={attempt.edit(setEmail)}
				error={attempt.field('identifier')}
				placeholder="you@example.com"
				keyboardType="email-address"
				autoComplete="email"
				textContentType="emailAddress"
				returnKeyType="next"
				submitBehavior="submit"
				onSubmitEditing={() => passwordRef.current?.focus()}
			/>

			<View className="h-5" />

			<Field
				ref={passwordRef}
				label="Password"
				secure
				value={password}
				onChangeText={attempt.edit(setPassword)}
				error={attempt.field('password')}
				placeholder="Your password"
				autoComplete="current-password"
				textContentType="password"
				returnKeyType="go"
				onSubmitEditing={handleLogIn}
			/>

			{banner ? (
				<>
					<View className="h-3" />
					<ErrorBanner message={banner} />
				</>
			) : null}

			<View className="h-4" />

			<View className="w-full flex-row">
				<TextLink
					label="Forgot password?"
					onPress={() => router.push('/forgot-password')}
				/>
			</View>

			<View className="h-7" />

			<Button
				label="Log in"
				busyLabel="Logging in…"
				busy={submitting}
				disabled={!canSubmit}
				onPress={handleLogIn}
			/>
		</AuthScreen>
	);
}
