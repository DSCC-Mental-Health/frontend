import { Text, View } from 'react-native';
import useScreenPadding from '@/components/ui/useScreenPadding';

/**
 * Placeholder — no Figma frame for this tab yet. Exists so the tab bar has a
 * real destination instead of a dead end.
 */
export default function SupportScreen() {
	const padding = useScreenPadding();

	return (
		<View
			className="flex-1 bg-canvas px-5"
			style={padding}
		>
			<Text className="font-inter-bold text-large-title text-ink">
				Support
			</Text>

			<View className="h-2" />

			<Text className="font-inter text-callout text-ink-muted">
				People you can talk to, on and off camp.
			</Text>
		</View>
	);
}
