import DiscardSheet from '@/components/DiscardSheet';
import EventTag from '@/components/reflection/EventTag';
import Button from '@/components/ui/Button';
import Callout from '@/components/ui/Callout';
import ChoiceChip, { ChoiceGroup } from '@/components/ui/ChoiceChip';
import TextButton from '@/components/ui/TextButton';
import useScreenPadding from '@/components/ui/useScreenPadding';
import { GUTTER } from '@/constants/layout';
import { add as addJournalEntry, useJournal } from '@/data/journal-store';
import {
	CONCERNS,
	FEELINGS,
	daysUntil,
	dismissPrompt,
	easierCount,
	getMilestone,
	relativeLabel,
} from '@/data/milestones';
import { useAuth } from '@clerk/expo';
import { Redirect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, ScrollView, Text, View } from 'react-native';

function Label({ children }) {
	return <Text className="w-full font-inter-semibold text-body text-ink">{children}</Text>;
}

/**
 * "U5 Before a milestone" (node 187:74), offered on Home the day before a
 * milestone starts. Saves a journal entry (`kind: 'expectation'`) that the
 * reflection afterwards quotes back ("You said you were nervous…").
 *
 * The frame also has Skip in the header; on a one-screen form it would do the
 * same as "Not now", so it's left out.
 */
export default function ExpectScreen() {
	const padding = useScreenPadding({ bottom: 20, bottomGap: 8 });
	const router = useRouter();
	const navigation = useNavigation();
	const { isLoaded, isSignedIn } = useAuth();
	const { id } = useLocalSearchParams();
	const entries = useJournal();

	const [feeling, setFeeling] = useState(null);
	const [concerns, setConcerns] = useState([]);
	const [confirmingClose, setConfirmingClose] = useState(false);

	const dirty = Boolean(feeling || concerns.length);

	useEffect(() => {
		navigation.setOptions({ gestureEnabled: !dirty });
	}, [navigation, dirty]);

	useEffect(() => {
		if (!dirty) return undefined;
		const sub = BackHandler.addEventListener('hardwareBackPress', () => {
			setConfirmingClose(true);
			return true;
		});
		return () => sub.remove();
	}, [dirty]);

	if (!isLoaded) return null;
	if (!isSignedIn) return <Redirect href="/login" />;

	const milestone = getMilestone(id);
	if (!milestone) return <Redirect href="/home" />;

	const when = relativeLabel(milestone);
	const headline =
		daysUntil(milestone) === 1
			? `${milestone.title} starts tomorrow.`
			: `${milestone.title}: ${when.toLowerCase()}.`;
	// Only claim a pattern once there's more than one reflection behind it.
	const easier = easierCount(entries);

	function dismiss() {
		setConfirmingClose(false);
		if (router.canGoBack()) router.back();
		else router.replace('/home');
	}

	function close() {
		if (dirty) setConfirmingClose(true);
		else dismiss();
	}

	function notNow() {
		dismissPrompt('expect', milestone.id);
		dismiss();
	}

	function save() {
		const parts = [
			{ prompt: 'How are you feeling about it?', text: feeling ?? '' },
			{ prompt: "What's on your mind about it?", text: concerns.join(', ') },
		].filter((part) => part.text);

		// TODO: replace the in-memory journal store with the journal API.
		addJournalEntry({
			kind: 'expectation',
			milestoneId: milestone.id,
			mood: null,
			parts,
			answers: { feeling, concerns },
		});
		dismiss();
	}

	function toggleConcern(c) {
		setConcerns((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
	}

	return (
		<View className="flex-1 bg-canvas" style={{ paddingHorizontal: GUTTER, ...padding }}>
			<View className="w-full flex-row">
				<TextButton label="Close" onPress={close} />
			</View>

			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ flexGrow: 1 }}
			>
				<View className="h-6" />
				<EventTag tone="warn" label={`${when.toUpperCase()} · ${milestone.title.toUpperCase()}`} />
				<View className="h-4" />
				<Text
					accessibilityRole="header"
					className="w-full font-inter-bold text-large-title text-ink"
				>
					{headline}
				</Text>
				<View className="h-3" />
				<Text className="w-full font-inter text-body text-ink-muted">
					Writing down what you&rsquo;re expecting now gives you something to compare against
					afterwards.
				</Text>

				<View className="h-6" />
				<Label>How are you feeling about it?</Label>
				<View className="h-3" />
				<ChoiceGroup>
					{FEELINGS.map((f) => (
						<ChoiceChip
							key={f}
							label={f}
							selected={feeling === f}
							onPress={() => setFeeling(feeling === f ? null : f)}
						/>
					))}
				</ChoiceGroup>

				<View className="h-6" />
				<Label>What&rsquo;s on your mind about it?</Label>
				<View className="h-3" />
				<ChoiceGroup multiple>
					{CONCERNS.map((c) => (
						<ChoiceChip
							key={c}
							label={c}
							role="checkbox"
							selected={concerns.includes(c)}
							onPress={() => toggleConcern(c)}
						/>
					))}
				</ChoiceGroup>

				{easier >= 2 ? (
					<>
						<View className="h-5" />
						<Callout
							title="From your own logs"
							body={`The waiting has been harder than the event itself ${easier} times so far.`}
						/>
					</>
				) : null}

				<View className="min-h-6 flex-1" />
			</ScrollView>

			<Button label="Save" disabled={!dirty} onPress={save} />
			<View className="h-3" />
			<Button label="Not now" tone="secondary" onPress={notNow} />

			<DiscardSheet
				visible={confirmingClose}
				body="Your answers aren't saved yet."
				onSave={save}
				onDiscard={dismiss}
				onKeep={() => setConfirmingClose(false)}
			/>
		</View>
	);
}
