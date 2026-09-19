import { Pressable, Text, View } from 'react-native';

/**
 * Row option — I3 mood, I5 coping, I7 reminder (nodes 16:45, 17:13, 17:57).
 *
 * Unselected is a white pill with a 1px hairline and medium label; selected
 * fills with accent and switches the label to bold white (bold so it clears the
 * contrast minimum on the orange). `role` tells screen readers whether it's one
 * of a set (`radio`, I3/I7) or can be combined (`checkbox`, I5).
 */
export function OptionRow({ label, selected, role = 'radio', onPress }) {
	return (
		<Pressable
			accessibilityRole={role}
			accessibilityState={{ checked: selected }}
			onPress={onPress}
			className={`w-full flex-row items-center overflow-hidden rounded-field border px-4 py-3.5 active:opacity-80 ${
				selected ? 'border-accent bg-accent' : 'border-hairline bg-white'
			}`}
		>
			<Text
				className={`text-[15px] ${
					selected ? 'font-inter-bold text-white' : 'font-inter-medium text-ink'
				}`}
			>
				{label}
			</Text>
		</Pressable>
	);
}

/**
 * Card option — I6 reach-out (node 17:37). Selection is a 2px accent border on
 * the same white fill, plus a filled check so it doesn't rest on colour alone.
 */
export function OptionCard({ title, body, selected, onPress }) {
	return (
		<Pressable
			accessibilityRole="radio"
			accessibilityState={{ checked: selected }}
			onPress={onPress}
			className={`w-full gap-1.5 overflow-hidden rounded-control bg-white px-4.5 py-4 active:opacity-80 ${
				selected ? 'border-2 border-accent' : 'border border-hairline'
			}`}
		>
			<View className="w-full flex-row items-center gap-3">
				<Text className="flex-1 font-inter-semibold text-[16px] text-ink">{title}</Text>
				{selected ? (
					<View className="size-5.5 items-center justify-center rounded-full bg-accent">
						<Text className="font-inter-bold text-[12px] text-white">✓</Text>
					</View>
				) : (
					<View className="size-5.5 rounded-full border-1.5 border-hairline" />
				)}
			</View>
			<Text className="w-full font-inter text-[13px] leading-[18.2px] text-ink-muted">
				{body}
			</Text>
		</Pressable>
	);
}

/** Plain information card — I8 summary (node 17:77). */
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
