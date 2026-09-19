import { STEP_COMPONENTS, STEPS } from '@/components/onboarding/Steps';
import { REMINDERS } from '@/data/onboarding';
import { cancelDailyReminder, scheduleDailyReminder } from '@/lib/reminders';
import { useAuth, useUser } from '@clerk/expo';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';

/**
 * First-run onboarding — Figma I1–I8 (nodes 16:2 … 17:68), minus I4.
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
	const [error, setError] = useState(null);
	const [answers, setAnswers] = useState({
		mood: null,
		coping: [],
		reachOut: null,
		reminder: null,
		/** 'scheduled' | 'denied' | 'unavailable' once I7's Continue has run. */
		reminderStatus: null,
	});

	const back = useCallback(() => {
		if (index === 0 || busy) return false;
		setError(null);
		setIndex((i) => i - 1);
		return true;
	}, [index, busy]);

	// Android's back gesture; iOS uses the Back link each step draws.
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

	// Asking here, right after they picked a time, is when the permission prompt
	// makes the most sense.
	async function scheduleReminder() {
		const reminder = REMINDERS.find((r) => r.id === answers.reminder);
		if (reminder) {
			setBusy(true);
			const status = await scheduleDailyReminder(reminder);
			setAnswer('reminderStatus', status);
			setBusy(false);
		} else if (answers.reminderStatus === 'scheduled') {
			await cancelDailyReminder();
			setAnswer('reminderStatus', null);
		}
		setIndex((i) => i + 1);
	}

	async function finish() {
		setBusy(true);
		setError(null);
		try {
			// Deep-merge, so this leaves any other unsafeMetadata alone. Awaited
			// before navigating — the tabs guard reads this flag immediately and
			// would bounce straight back here on a stale read.
			await user.updateMetadata({
				unsafeMetadata: { onboardingComplete: true, onboarding: answers },
			});
			router.replace('/home');
		} catch {
			// Stay on I8 with the button live so they can retry.
			setError("Couldn't save your setup. Check your connection and try again.");
			setBusy(false);
		}
	}

	const step = STEPS[index];
	const Step = STEP_COMPONENTS[index];

	let onNext = () => setIndex((i) => i + 1);
	if (step.id === 'reminder') onNext = scheduleReminder;
	if (index === STEPS.length - 1) onNext = finish;

	return (
		<Step
			step={step}
			answers={answers}
			setAnswer={setAnswer}
			busy={busy}
			error={error}
			onNext={onNext}
			onBack={index === 0 ? undefined : back}
		/>
	);
}
