import { View } from 'react-native';

/**
 * Progress dots for a short multi-step flow: a wide accent bar for the current
 * step, small hairline dots for the others. `step` is zero-based.
 */
export default function StepDots({ step, total = 2, label = 'Question' }) {
	return (
		<View
			accessible
			accessibilityRole="progressbar"
			accessibilityLabel={`${label} ${step + 1} of ${total}`}
			accessibilityValue={{ min: 1, max: total, now: step + 1 }}
			className="flex-row items-center gap-2"
		>
			{Array.from({ length: total }, (_, i) =>
				i === step ? (
					<View key={i} className="h-1.5 w-5 rounded-full bg-accent" />
				) : (
					<View key={i} className="size-1.5 rounded-full bg-hairline" />
				),
			)}
		</View>
	);
}
