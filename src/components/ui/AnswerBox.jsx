import { INK_FAINT } from '@/constants/colors';
import { Text, TextInput, View } from 'react-native';

/**
 * Multi-line answer field. The outline turns accent once there's text, and the
 * characters-left count appears then too. `accessibilityLabel` should be the
 * question being answered.
 */
export default function AnswerBox({
	value,
	onChangeText,
	placeholder,
	maxLength,
	accessibilityLabel,
}) {
	const hasText = value.trim().length > 0;

	return (
		<View
			className={`w-full gap-2 overflow-hidden rounded-lg bg-white px-4 py-4 ${
				hasText ? 'border-2 border-accent' : 'border border-hairline'
			}`}
		>
			<TextInput
				value={value}
				onChangeText={onChangeText}
				accessibilityLabel={accessibilityLabel}
				placeholder={placeholder}
				placeholderTextColor={INK_FAINT}
				multiline
				maxLength={maxLength}
				textAlignVertical="top"
				className="w-full p-0 font-inter text-body text-ink"
			/>
			{hasText ? (
				<Text className="w-full text-right font-inter text-caption text-ink-faint">
					{maxLength - value.length} characters left
				</Text>
			) : null}
		</View>
	);
}
