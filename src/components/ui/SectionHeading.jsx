import { Text, View } from 'react-native';
import TextButton from './TextButton';

/** A section title with an optional orange link on the right (S2, R2). */
export default function SectionHeading({ title, action, onAction }) {
	return (
		<View className="w-full flex-row items-center justify-between">
			<Text accessibilityRole="header" className="font-inter-semibold text-[15px] text-ink">
				{title}
			</Text>
			{action ? (
				<TextButton label={action} variant="link" role="link" onPress={onAction} />
			) : null}
		</View>
	);
}
