import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';

/** `ink-muted` in tailwind.config.js — SymbolView takes a colour, not a class. */
const TINT = '#73675d';

/**
 * A tool's tile: one SF Symbol on a neutral square, the same set everywhere a
 * tool appears (N1 library, Home quick tools). Neutral on purpose — the mood
 * colours are kept for moods. Off iOS, SF Symbols don't exist, so the square
 * shows empty.
 */
export default function ToolIcon({ tool, size = 40 }) {
	return (
		<View
			className="items-center justify-center rounded-day bg-avatar"
			style={{ width: size, height: size }}
		>
			<SymbolView
				name={tool.icon}
				size={Math.round(size * 0.5)}
				tintColor={TINT}
				type="monochrome"
				fallback={null}
			/>
		</View>
	);
}
