import { Stack } from 'expo-router';

/**
 * Insights keeps its own stack so the BMT timeline (R3, node 176:2) opens on top
 * of R2 with the tab bar still showing and Insights still selected, as drawn.
 */
export default function InsightsLayout() {
	return <Stack screenOptions={{ headerShown: false }} />;
}
