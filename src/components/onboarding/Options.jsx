import { Pressable, Text, View } from 'react-native';

/**
 * Row option — I3 mood, I5 coping, I7 reminder (nodes 16:45, 17:13, 17:57).
 *
 * Unselected is a white pill with a 1px hairline and medium label; selected
 * fills with accent and switches the label to semibold white.
 */
export function OptionRow({ label, selected, onPress }) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ selected }}
			onPress={onPress}
			className={`w-full flex-row items-center overflow-hidden rounded-field border px-4 py-3.5 active:opacity-80 ${
				selected ? 'border-accent bg-accent' : 'border-hairline bg-white'
			}`}
		>
			<Text
				className={`text-[15px] ${
					selected ? 'font-inter-semibold text-white' : 'font-inter-medium text-ink'
				}`}
			>
				{label}
			</Text>
		</Pressable>
	);
}

/**
 * Card option — I6 reach-out (node 17:37). Selection is a 2px accent border on
 * the same white fill, not a colour change.
 */
export function OptionCard({ title, body, selected, onPress }) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ selected }}
			onPress={onPress}
			className={`w-full gap-1.5 overflow-hidden rounded-control bg-white px-4.5 py-4 active:opacity-80 ${
				selected ? 'border-2 border-accent' : 'border border-hairline'
			}`}
		>
			<Text className="font-inter-semibold text-[16px] text-ink">{title}</Text>
			<Text className="w-full font-inter text-[13px] leading-[18.2px] text-ink-muted">
				{body}
			</Text>
		</Pressable>
	);
}

/** Plain information card — I4 example insights, I8 summary (nodes 16:69, 17:77). */
export function InfoCard({ title, body }) {
	return (
		<View className="w-full gap-1.5 overflow-hidden rounded-control border border-hairline bg-white px-4.5 py-4">
			<Text className="font-inter-semibold text-[16px] text-ink">{title}</Text>
			<Text className="w-full font-inter text-[13px] leading-[18.2px] text-ink-muted">
				{body}
			</Text>
		</View>
	);
}
