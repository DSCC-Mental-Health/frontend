import AuthScreen, { ErrorBanner, TextLink } from '@/components/auth/AuthScreen';
import Field from '@/components/auth/Field';
import useAuthErrors from '@/components/auth/useAuthErrors';
import Button from '@/components/ui/Button';
import { useSignIn } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';

const FALLBACK = "Couldn't reset your password. Check the details and try again.";

/**
 * Password reset — no Figma frame yet, so it reuses the W1 log in layout.
 *
 * Clerk's email-code reset: start a sign-in for the address, email a code,
 * verify it, then set the new password, which also logs them in.
 */
export default function ForgotPasswordScreen() {
	const router = useRouter();
	const { signIn, errors, fetchStatus } = useSignIn();

	const passwordRef = useRef(null);
	const [step, setStep] = useState('email');
	const [email, setEmail] = useState('');
	const [code, setCode] = useState('');
	const [password, setPassword] = useState('');
	// A verified code can't be verified twice, so a rejected new password
	// retries only the password step.
	const [codeVerified, setCodeVerified] = useState(false);
	const [resent, setResent] = useState(false);
	const attempt = useAuthErrors(errors, FALLBACK);

	const busy = fetchStatus === 'fetching';

	async function sendCode() {
		if (busy) return;
		attempt.clear();

		const { error } = await signIn.create({ identifier: email.trim() });
		if (error) return attempt.fail({ clerk: error });

		const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
		if (sendError) return attempt.fail({ clerk: sendError });

		setStep('reset');
	}

	async function resend() {
		attempt.clear();
		const { error } = await signIn.resetPasswordEmailCode.sendCode();
		if (error) return attempt.fail({ clerk: error });
		setResent(true);
	}

	async function reset() {
		if (busy) return;
		attempt.clear();

		if (!codeVerified) {
			const { error } = await signIn.resetPasswordEmailCode.verifyCode({
				code: code.trim(),
			});
			if (error) return attempt.fail({ clerk: error });
			setCodeVerified(true);
		}

		const { error } = await signIn.resetPasswordEmailCode.submitPassword({ password });
		if (error) return attempt.fail({ clerk: error });

		if (signIn.status !== 'complete') {
			return attempt.fail({ message: 'One more step is needed to finish logging in.' });
		}

		const { error: finalizeError } = await signIn.finalize();
		if (finalizeError) return attempt.fail({ clerk: finalizeError });

		router.replace('/home');
	}

	if (step === 'reset') {
		const banner = attempt.banner(['code', 'password']);

		return (
			<AuthScreen
				onBack={() => {
					setStep('email');
					setCodeVerified(false);
					attempt.clear();
				}}
				title="Check your email"
				body={`Enter the 6-digit code sent to ${email.trim()}, then choose a new password.`}
			>
				{codeVerified ? null : (
					<>
						<Field
							label="Code"
							value={code}
							onChangeText={attempt.edit(setCode)}
							error={attempt.field('code')}
							placeholder="123456"
							keyboardType="number-pad"
							autoComplete="one-time-code"
							textContentType="oneTimeCode"
							maxLength={6}
							returnKeyType="next"
							submitBehavior="submit"
							onSubmitEditing={() => passwordRef.current?.focus()}
						/>

						<View className="h-4" />

						<View className="w-full flex-row items-center gap-2">
							<TextLink label="Send a new code" onPress={resend} />
							{resent ? (
								<Text className="font-inter text-subhead text-ink-muted">Sent.</Text>
							) : null}
						</View>

						<View className="h-5" />
					</>
				)}

				<Field
					ref={passwordRef}
					label="New password"
					secure
					value={password}
					onChangeText={attempt.edit(setPassword)}
					error={attempt.field('password')}
					placeholder="At least 8 characters"
					autoComplete="new-password"
					textContentType="newPassword"
					returnKeyType="go"
					onSubmitEditing={reset}
				/>

				{banner ? (
					<>
						<View className="h-3" />
						<ErrorBanner message={banner} />
					</>
				) : null}

				<View className="h-7" />

				<Button
					label="Reset password"
					busyLabel="Resetting…"
					busy={busy}
					disabled={(!codeVerified && code.trim().length < 6) || !password}
					onPress={reset}
				/>
			</AuthScreen>
		);
	}

	const banner = attempt.banner(['identifier']);

	return (
		<AuthScreen
			title="Reset your password"
			body="Enter the email you log in with and a 6-digit code will be sent to it."
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
				returnKeyType="go"
				onSubmitEditing={sendCode}
			/>

			{banner ? (
				<>
					<View className="h-3" />
					<ErrorBanner message={banner} />
				</>
			) : null}

			<View className="h-7" />

			<Button
				label="Send code"
				busyLabel="Sending…"
				busy={busy}
				disabled={!email.trim()}
				onPress={sendCode}
			/>
		</AuthScreen>
	);
}
