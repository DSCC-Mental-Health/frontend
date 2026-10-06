import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import TextButton from '@/components/ui/TextButton';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { GUTTER } from '@/constants/layout';
import { CODE_PARTS, findPlatoon, join, platoonName, splitCode } from '@/data/platoon-store';
import { useAuth } from '@clerk/expo';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';

const EMPTY = CODE_PARTS.map(() => '');

/** One of Q4's three code boxes. Borders follow the auth Field. */
function CodeBox({ part, value, error, ref, onChangeText, onKeyPress, onSubmitEditing }) {
	const [focused, setFocused] = useState(false);

	let border = 'border border-hairline';
	if (error) border = 'border-2 border-danger';
	else if (focused) border = 'border-2 border-accent';

	return (
		<View className={`h-14 flex-1 items-center justify-center rounded-md bg-white ${border}`}>
			<TextInput
				ref={ref}
				accessibilityLabel={`Platoon code, ${part.label.toLowerCase()}`}
				value={value}
				onChangeText={onChangeText}
				onKeyPress={onKeyPress}
				onSubmitEditing={onSubmitEditing}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				autoCapitalize="characters"
				autoCorrect={false}
				spellCheck={false}
				returnKeyType="next"
				textAlign="center"
				className="w-full p-0 font-inter-semibold text-headline text-ink"
			/>
		</View>
	);
}

/** Q5's two panels: what commanders see, and what they never see. */
function SeeList({ title, items, mark, tone }) {
	const calm = tone === 'calm';
	const strong = calm ? 'text-calm-strong' : 'text-accent-strong';

	return (
		<View
			className={`w-full gap-3 overflow-hidden rounded-lg px-4 py-4 ${
				calm ? 'bg-calm-surface' : 'border border-hairline bg-white'
			}`}
		>
			<Text accessibilityRole="header" className={`font-inter-semibold text-callout ${strong}`}>
				{title}
			</Text>
			{items.map((item) => (
				<View key={item} className="w-full flex-row items-start gap-3">
					<Text importantForAccessibility="no" className={`font-inter-bold text-subhead ${strong}`}>
						{mark}
					</Text>
					<Text className="flex-1 font-inter text-subhead text-ink">{item}</Text>
				</View>
			))}
		</View>
	);
}

/**
 * "Q4 Join your platoon — enter code" (node 315:69) and "Q5 Join — what
 * commanders see" (315:103), one route with the step in state.
 *
 * `from` says where it was opened: 'onboarding' (Skip goes to Home),
 * 'settings', or 'platoon' (Q6's "Changed platoon?").
 */
export default function JoinScreen() {
	const padding = useScreenPadding({ bottom: 20, bottomGap: 8 });
	const router = useRouter();
	const { isLoaded, isSignedIn } = useAuth();
	const { from } = useLocalSearchParams();
	const fromOnboarding = from === 'onboarding';

	const [parts, setParts] = useState(EMPTY);
	const [step, setStep] = useState(0);
	const inputs = [useRef(null), useRef(null), useRef(null)];

	if (!isLoaded) return null;
	if (!isSignedIn) return <Redirect href="/login" />;

	const complete = parts.every(Boolean);
	const platoon = complete ? findPlatoon(parts.join('-')) : null;
	const notFound = complete && !platoon;

	function leaveScreen() {
		if (fromOnboarding) router.replace('/home');
		else if (router.canGoBack()) router.back();
		else router.replace('/settings');
	}

	function change(i, text) {
		// A whole code pasted (or autofilled) into any box fills all three.
		const pasted = splitCode(text);
		if (pasted && text.length > CODE_PARTS[i].maxLength) {
			setParts(pasted.map((p, j) => p.slice(0, CODE_PARTS[j].maxLength)));
			inputs[CODE_PARTS.length - 1].current?.blur();
			return;
		}

		const value = text
			.toUpperCase()
			.replace(/[^A-Z0-9]/g, '')
			.slice(0, CODE_PARTS[i].maxLength);
		setParts((prev) => prev.map((p, j) => (j === i ? value : p)));
		if (value.length === CODE_PARTS[i].maxLength && i < CODE_PARTS.length - 1) {
			inputs[i + 1].current?.focus();
		}
	}

	function keyPress(i, key) {
		// Backspace in an empty box goes back to the one before.
		if (key === 'Backspace' && !parts[i] && i > 0) inputs[i - 1].current?.focus();
	}

	function confirm() {
		join(parts.join('-'));
		if (fromOnboarding) router.replace('/home');
		else if (from === 'platoon') router.back();
		else router.replace('/platoon');
	}

	function reenter() {
		setParts(EMPTY);
		setStep(0);
	}

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-canvas"
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<View className="flex-1" style={{ paddingHorizontal: GUTTER, ...padding }}>
				<BackButton onPress={step === 1 ? () => setStep(0) : leaveScreen} />

				<ScrollView
					className="flex-1"
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1 }}
				>
					<View className="h-6" />

					{step === 0 ? (
						<>
							<Text
								accessibilityRole="header"
								className="w-full font-inter-bold text-large-title text-ink"
							>
								Join your platoon
							</Text>
							<View className="h-2" />
							<Text className="w-full font-inter text-callout text-ink-muted">
								Your platoon commander shares a code at your first briefing. It links you to
								your platoon&rsquo;s totals — not to your name.
							</Text>

							<View className="h-8" />
							<Text className="w-full font-inter-semibold text-subhead text-ink">
								Platoon code
							</Text>
							<View className="h-2" />
							<View className="w-full flex-row items-center gap-2">
								{CODE_PARTS.map((part, i) => (
									<View key={part.label} className="flex-1 flex-row items-center gap-2">
										{i > 0 ? (
											<Text
												importantForAccessibility="no"
												className="font-inter text-body-lg text-ink-faint"
											>
												–
											</Text>
										) : null}
										<CodeBox
											ref={inputs[i]}
											part={part}
											value={parts[i]}
											error={notFound}
											onChangeText={(text) => change(i, text)}
											onKeyPress={({ nativeEvent }) => keyPress(i, nativeEvent.key)}
											onSubmitEditing={() => inputs[i + 1]?.current?.focus()}
										/>
									</View>
								))}
							</View>

							<View className="h-3" />
							{platoon ? (
								<Text
									accessibilityLiveRegion="polite"
									className="w-full font-inter-medium text-subhead text-calm-strong"
								>
									✓ {platoonName(platoon)} found
								</Text>
							) : null}
							{notFound ? (
								<Text
									accessibilityRole="alert"
									className="w-full font-inter-semibold text-footnote text-danger"
								>
									No platoon with that code. Check it with your platoon commander.
								</Text>
							) : null}
						</>
					) : (
						<>
							<Text
								accessibilityRole="header"
								className="w-full font-inter-bold text-large-title text-ink"
							>
								Before you join
							</Text>
							<View className="h-2" />
							<Text className="w-full font-inter text-callout text-ink-muted">
								You&rsquo;re joining {platoonName(platoon)} · Cohort {platoon.cohort}.
							</Text>

							<View className="h-6" />
							<SeeList
								tone="calm"
								title="Your commanders see"
								mark="•"
								items={[
									'Totals for the whole platoon, like “7 of 32 slept badly 3+ nights”',
									'Nothing at all if fewer than 10 people are in a group',
								]}
							/>
							<View className="h-3" />
							<SeeList
								title="They never see"
								mark="✕"
								items={[
									'Your name, or that you use Steady',
									'Your check-ins, journal or mood',
									'Whether you contacted a support service',
								]}
							/>
							<View className="h-4" />
							<Text className="w-full font-inter text-footnote text-ink-muted">
								You can leave your platoon any time in Settings. Your own entries stay yours
								either way.
							</Text>
						</>
					)}

					<View className="min-h-6 flex-1" />
				</ScrollView>

				{step === 0 ? (
					<>
						<Button label="Continue" disabled={!platoon} onPress={() => setStep(1)} />
						{fromOnboarding ? (
							<>
								<View className="h-4" />
								<TextButton
									label="Skip — use Steady on my own"
									variant="linkStrong"
									onPress={leaveScreen}
									className="self-center"
								/>
							</>
						) : null}
					</>
				) : (
					<>
						<Button label={`Join Platoon ${platoon.platoon}`} onPress={confirm} />
						<View className="h-3" />
						<Button label="Not my platoon — re-enter code" tone="secondary" onPress={reenter} />
					</>
				)}
			</View>
		</KeyboardAvoidingView>
	);
}
