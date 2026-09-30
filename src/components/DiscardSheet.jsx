import Sheet from '@/components/Sheet';
import Button from '@/components/ui/Button';
import { Text, View } from 'react-native';

/**
 * Asked before closing a writing screen would throw words away — the check-in
 * and free write. `body` says what survives (e.g. the mood is already logged).
 */
export default function DiscardSheet({ visible, body, onSave, onDiscard, onKeep }) {
	return (
		<Sheet visible={visible} onClose={onKeep}>
			<Text className="font-inter-bold text-title-sm text-ink">
				Keep what you wrote?
			</Text>
			{body ? (
				<>
					<View className="h-3" />
					<Text className="w-full font-inter text-callout text-ink-muted">
						{body}
					</Text>
				</>
			) : null}
			<View className="h-5" />
			<Button label="Save entry" onPress={onSave} />
			<View className="h-3" />
			<Button label="Discard writing" tone="dangerOutline" onPress={onDiscard} />
			<View className="h-3" />
			<Button label="Keep writing" tone="secondary" onPress={onKeep} />
		</Sheet>
	);
}
