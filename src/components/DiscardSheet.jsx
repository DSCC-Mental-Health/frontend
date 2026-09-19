import Sheet from '@/components/Sheet';
import { Pressable, Text, View } from 'react-native';

function SheetButton({ label, tone = 'plain', onPress }) {
	const primary = tone === 'primary';
	return (
		<Pressable
			accessibilityRole="button"
			onPress={onPress}
			className={`w-full items-center justify-center overflow-hidden rounded-control py-4 ${
				primary ? 'bg-accent active:opacity-85' : 'border border-hairline bg-white active:opacity-80'
			}`}
		>
			<Text
				className={`text-[16px] ${
					primary
						? 'font-inter-bold text-white'
						: tone === 'danger'
							? 'font-inter-semibold text-danger'
							: 'font-inter-semibold text-ink'
				}`}
			>
				{label}
			</Text>
		</Pressable>
	);
}

/**
 * Asked before closing a writing screen would throw words away — the check-in
 * and free write. `body` says what survives (e.g. the mood is already logged).
 */
export default function DiscardSheet({ visible, body, onSave, onDiscard, onKeep }) {
	return (
		<Sheet visible={visible} onClose={onKeep}>
			<Text className="font-inter-bold text-[20px] leading-[29px] text-ink">
				Keep what you wrote?
			</Text>
			{body ? (
				<>
					<View className="h-2.5" />
					<Text className="w-full font-inter text-[14px] leading-[20.3px] text-ink-muted">
						{body}
					</Text>
				</>
			) : null}
			<View className="h-5" />
			<SheetButton label="Save entry" tone="primary" onPress={onSave} />
			<View className="h-2.5" />
			<SheetButton label="Discard writing" tone="danger" onPress={onDiscard} />
			<View className="h-2.5" />
			<SheetButton label="Keep writing" onPress={onKeep} />
		</Sheet>
	);
}
