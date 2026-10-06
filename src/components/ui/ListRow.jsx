import { Pressable, Text, View } from 'react-native';

const LABEL = {
	ink: 'text-ink',
	/** A row that undoes something, e.g. "Leave platoon" (Q6). */
	accent: 'text-accent-strong',
};

/**
 * A tappable card row with a chevron: Settings' rows, Q6's "Changed platoon?".
 * `value` sits on the right; `detail` is a line under the label.
 */
export default function ListRow({ label, value, detail, tone = 'ink', onPress, disabled }) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ disabled: Boolean(disabled) }}
			accessibilityHint={detail}
			onPress={onPress}
			disabled={disabled}
			className="w-full flex-row items-center justify-between gap-3 overflow-hidden rounded-lg border border-hairline bg-white px-4 py-4 active:opacity-80"
		>
			<View className="flex-1 gap-1">
				<Text className={`font-inter-semibold text-body ${LABEL[tone]}`}>{label}</Text>
				{detail ? (
					<Text className="w-full font-inter text-footnote text-ink-muted">{detail}</Text>
				) : null}
			</View>
			<View className="flex-row items-center gap-2">
				{value ? (
					<Text numberOfLines={1} className="font-inter text-subhead text-ink-faint">
						{value}
					</Text>
				) : null}
				<Text className="font-inter-semibold text-body text-ink-faint">›</Text>
			</View>
		</Pressable>
	);
}
