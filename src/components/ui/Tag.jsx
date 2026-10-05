import { Text, View } from 'react-native';

/**
 * Small label pills under a card ("Nothing revealed", "In-app", "24/7").
 * - neutral: plain facts
 * - calm: nothing about you is revealed
 * - warn: something is (Figma's amber isn't in the palette, so it's `warn` at
 *   20% with ink text)
 */
const TONES = {
	neutral: { box: 'bg-surface-muted', label: 'font-inter-medium text-ink-muted' },
	calm: { box: 'bg-calm-surface', label: 'font-inter-semibold text-calm-strong' },
	warn: { box: 'bg-warn/20', label: 'font-inter-semibold text-ink' },
};

export default function Tag({ label, tone = 'neutral' }) {
	const look = TONES[tone];
	return (
		<View className={`overflow-hidden rounded-sm px-2 py-1 ${look.box}`}>
			<Text className={`text-caption ${look.label}`}>{label}</Text>
		</View>
	);
}
