import { Text } from 'react-native';

/**
 * The small spaced capitals above a card's content: "A QUESTION FOR YOU",
 * "YOU WROTE", "WEEK 1". 11pt — the iOS minimum — in `ink-faint` unless a
 * dark card passes `className` (e.g. `text-white`).
 */
export default function Eyebrow({ children, className = 'text-ink-faint' }) {
	return (
		<Text className={`font-inter-semibold text-caption tracking-eyebrow ${className}`}>
			{children}
		</Text>
	);
}
