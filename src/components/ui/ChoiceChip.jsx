import { Pressable, Text, View } from 'react-native';

/**
 * A tap-to-pick chip that sizes to its label and wraps with its neighbours —
 * for picking one (`role="radio"`) or several (`role="checkbox"`) from a set.
 * Selected chips fill with the accent; the label is bold because white on the
 * accent only passes contrast as bold text.
 */
export default function ChoiceChip({ label, selected, onPress, role = 'radio' }) {
	return (
		<Pressable
			accessibilityRole={role}
			accessibilityState={{ checked: selected }}
			onPress={onPress}
			className={`min-h-11 justify-center overflow-hidden rounded-md border px-4 active:opacity-80 ${
				selected ? 'border-accent bg-accent' : 'border-hairline bg-white'
			}`}
		>
			<Text
				className={`text-subhead ${
					selected ? 'font-inter-bold text-white' : 'font-inter-medium text-ink'
				}`}
			>
				{label}
			</Text>
		</Pressable>
	);
}

/**
 * Lays chips out in wrapping rows. One-of sets are a radio group; a
 * multi-select isn't, since each checkbox announces itself.
 */
export function ChoiceGroup({ multiple = false, children }) {
	return (
		<View
			accessibilityRole={multiple ? undefined : 'radiogroup'}
			className="w-full flex-row flex-wrap gap-2"
		>
			{children}
		</View>
	);
}
