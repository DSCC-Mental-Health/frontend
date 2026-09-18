import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Placeholder — no Figma frame for this tab yet. Exists so the tab bar has a
 * real destination instead of a dead end.
 */
export default function ToolsScreen() {
	const insets = useSafeAreaInsets();

	return (
		<View
			className="flex-1 bg-aura-outer px-4.5"
			style={{ paddingTop: Math.max(54, insets.top + 8) }}
		>
			<Text className="font-inter-bold text-[28px] leading-[35.28px] text-ink">
				Tools
			</Text>

			<View className="h-2" />

			<Text className="font-inter text-[14px] leading-[20.44px] text-ink-muted">
				Short exercises for when things get heavy.
			</Text>
		</View>
	);
}
