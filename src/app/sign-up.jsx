import AuthScreen, {
	AuthFooter,
	ErrorBanner,
	SubmitButton,
	TextLink,
} from '@/components/auth/AuthScreen';
import { fieldError, formError } from '@/components/auth/errors';
import Field from '@/components/auth/Field';
import { useSignUp } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';

const FALLBACK = "Couldn't create your account. Check your details and try again.";

/**
 * Sign up — no Figma frame yet, so it reuses the W1 log in layout.
 *
 * Two steps on one route: email + password, then the 6-digit code Clerk emails
 * to prove the address. Finishing lands on /home, where the tabs guard sends
 * new accounts into onboarding.
 */
export default function SignUpScreen() {
	const router = useRouter();
	const { signUp, errors, fetchStatus } = useSignUp();

	const passwordRef = useRef(null);
	const [step, setStep] = useState('details');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [code, setCode] = useState('');
	const [failure, setFailure] = useState(null);
	const [resent, setResent] = useState(false);

	const busy = fetchStatus === 'fetching';
	const shown = failure?.clerk ? errors : null;

	function edit(setter) {
		return (value) => {
			setter(value);
			setFailure(null);
		};
	}

	async function createAccount() {
		if (busy) return;
		setFailure(null);

		const { error } = await signUp.password({ emailAddress: email.trim(), password });
		if (error) return setFailure({ clerk: error });

		const { error: sendError } = await signUp.verifications.sendEmailCode();
		if (sendError) return setFailure({ clerk: sendError });

		setStep('code');
	}

	async function verify() {
		if (busy) return;
		setFailure(null);

		const { error } = await signUp.verifications.verifyEmailCode({ code: code.trim() });
		if (error) return setFailure({ clerk: error });

		if (signUp.status !== 'complete') {
			// The Clerk instance asks for more than email + password.
			return setFailure({ message: 'One more step is needed to finish signing up.' });
		}

		const { error: finalizeError } = await signUp.finalize();
		if (finalizeError) return setFailure({ clerk: finalizeError });

		router.replace('/home');
	}

	async function resend() {
		setFailure(null);
		const { error } = await signUp.verifications.sendEmailCode();
		if (error) return setFailure({ clerk: error });
		setResent(true);
	}

	if (step === 'code') {
		const codeError = fieldError(shown, 'code');
		const banner = failure
			? (failure.message ?? formError(shown, ['code'], failure.clerk, FALLBACK))
			: null;

		return (
			<AuthScreen
				onBack={() => {
					setStep('details');
					setFailure(null);
				}}
				title="Check your email"
				body={`Enter the 6-digit code sent to ${email.trim()}.`}
			>
				<Field
					label="Code"
					value={code}
					onChangeText={edit(setCode)}
					error={codeError}
					placeholder="123456"
					keyboardType="number-pad"
					autoComplete="one-time-code"
					textContentType="oneTimeCode"
					maxLength={6}
					returnKeyType="go"
					onSubmitEditing={verify}
				/>

				{banner ? (
					<>
						<View className="h-2.5" />
						<ErrorBanner message={banner} />
					</>
				) : null}

				<View className="h-3.5" />

				<View className="w-full flex-row items-center gap-2">
					<TextLink label="Send a new code" onPress={resend} />
					{resent ? (
						<Text className="font-inter text-[13px] text-ink-muted">Sent.</Text>
					) : null}
				</View>

				<View className="h-6.5" />

				<SubmitButton
					label="Verify email"
					busyLabel="Checking…"
					busy={busy}
					disabled={code.trim().length < 6}
					onPress={verify}
				/>
			</AuthScreen>
		);
	}

	const emailError = fieldError(shown, 'emailAddress');
	const passwordError = fieldError(shown, 'password');
	const banner = failure
		? (failure.message ??
			formError(shown, ['emailAddress', 'password'], failure.clerk, FALLBACK))
		: null;

	return (
		<AuthScreen
			title="Create an account"
			body="A few details and you’re in. Nothing you write is ever shared with your commanders."
			footer={
				<AuthFooter
					prompt="Already have an account?"
					action="Log in"
					onPress={() => router.replace('/login')}
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
				placeholder="At least 8 characters"
				autoComplete="new-password"
				textContentType="newPassword"
				returnKeyType="go"
				onSubmitEditing={createAccount}
			/>

			{banner ? (
				<>
					<View className="h-2.5" />
					<ErrorBanner message={banner} />
				</>
			) : null}

			<View className="h-6.5" />

			<SubmitButton
				label="Create account"
				busyLabel="Creating account…"
				busy={busy}
				disabled={!email.trim() || !password}
				onPress={createAccount}
			/>
		</AuthScreen>
	);
}
