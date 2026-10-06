import EventTag from '@/components/reflection/EventTag';
import Sheet from '@/components/Sheet';
import Button from '@/components/ui/Button';
import { inSentence, milestoneWeek } from '@/data/milestones';
import { Text, View } from 'react-native';

/**
 * "U1 Event detected (prompt)" (node 186:2), shown over Home.
 *
 * `prompt` comes from `duePrompt`: a reflection on a milestone that's just
 * happened, or — with no frame of its own — the offer to note expectations
 * the day before one starts (U5). Every way out of the sheet counts as "not
 * today"; Home records that through `onDismiss`.
 */
export default function MilestonePrompt({ prompt, onReflect, onExpect, onDismiss }) {
	if (!prompt) return null;
	const { milestone } = prompt;
	const multiDay = (milestone.days ?? 1) > 1;

	if (prompt.kind === 'expect') {
		return (
			<Sheet visible onClose={onDismiss}>
				<EventTag tone="warn" label={`TOMORROW · ${milestone.title.toUpperCase()}`} />
				<View className="h-4" />
				<Text className="w-full font-inter-bold text-title-sm text-ink">
					{milestone.title} starts tomorrow.
				</Text>
				<View className="h-3" />
				<Text className="w-full font-inter text-callout text-ink-muted">
					Writing down what you&rsquo;re expecting now gives you something to compare
					against afterwards.
				</Text>
				<View className="h-5" />
				<Button label="Write it down" onPress={onExpect} />
				<View className="h-3" />
				<Button label="Not now" tone="secondary" onPress={onDismiss} />
			</Sheet>
		);
	}

	const when = prompt.lastChance ? 'yesterday' : 'today';
	const headline = multiDay
		? `${milestone.title} finished ${when}.`
		: `You had ${inSentence(milestone.title)} ${when}.`;

	return (
		<Sheet visible onClose={onDismiss}>
			<EventTag label={`${when.toUpperCase()} · WEEK ${milestoneWeek(milestone)}`} />
			<View className="h-4" />
			<Text className="w-full font-inter-bold text-title-sm text-ink">{headline}</Text>
			<View className="h-3" />
			<Text className="w-full font-inter text-callout text-ink-muted">
				Big days are worth a couple of minutes. Two questions, then you&rsquo;re done.
			</Text>
			<View className="h-5" />
			<Button label="Reflect on it" onPress={onReflect} />
			<View className="h-3" />
			<Button label="Just do my normal check-in" tone="secondary" onPress={onDismiss} />
			<View className="h-3" />
			<Button label="Not tonight" tone="secondary" onPress={onDismiss} />
			<View className="h-4" />
			<Text className="w-full text-center font-inter text-caption text-ink-faint">
				{prompt.lastChance
					? 'This is the last time Steady asks about this one.'
					: 'Steady will stop asking about this one after tomorrow.'}
			</Text>
		</Sheet>
	);
}
