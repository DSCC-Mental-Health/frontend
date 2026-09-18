import { STEP_COMPONENTS, STEPS } from '@/components/onboarding/Steps';
import { useAuth, useUser } from '@clerk/expo';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';

/**
 * First-run onboarding — Figma I1–I8 (nodes 16:2 … 17:68).
 *
 * One route holding the whole flow: the picks made on I3/I5/I6/I7 have to reach
 * the summary on I8, and keeping them in local state avoids a provider.
 */
export default function OnboardingScreen() {
	const router = useRouter();
	const { isLoaded: authLoaded, isSignedIn } = useAuth();
	const { isLoaded: userLoaded, user } = useUser();

	const [index, setIndex] = useState(0);
	const [busy, setBusy] = useState(false);
	const [answers, setAnswers] = useState({
		mood: null,
		coping: [],
		reachOut: null,
		reminder: null,
	});

	const back = useCallback(() => {
		if (index === 0) return false;
		setIndex((i) => i - 1);
		return true;
	}, [index]);

	// Without this, Android's back gesture leaves onboarding entirely instead of
	// stepping back through it.
	useEffect(() => {
		const sub = BackHandler.addEventListener('hardwareBackPress', back);
		return () => sub.remove();
	}, [back]);

	if (!authLoaded || !userLoaded) return null;
	if (!isSignedIn) return <Redirect href="/login" />;
	// Already done — don't let the flow be replayed.
	if (user?.unsafeMetadata?.onboardingComplete) return <Redirect href="/home" />;

	function setAnswer(key, value) {
		setAnswers((prev) => ({ ...prev, [key]: value }));
	}

	async function finish() {
		setBusy(true);
		try {
			// Deep-merge, so this leaves any other unsafeMetadata alone. Awaited
			// before navigating — the tabs guard reads this flag immediately and
			// would bounce straight back here on a stale read.
			await user.updateMetadata({
				unsafeMetadata: { onboardingComplete: true, onboarding: answers },
			});
			router.replace('/home');
		} catch {
			// Leave them on I8 with the button live so they can try again rather
			// than dropping them into a dashboard the guard will bounce out of.
			setBusy(false);
		}
	}

	const isLast = index === STEPS.length - 1;
	const Step = STEP_COMPONENTS[index];

	return (
		<Step
			step={STEPS[index]}
			answers={answers}
			setAnswer={setAnswer}
			busy={busy}
			onNext={isLast ? finish : () => setIndex((i) => i + 1)}
		/>
	);
}
