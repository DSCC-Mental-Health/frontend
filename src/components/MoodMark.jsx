import { View } from 'react-native';

/**
 * A mood as a shape as well as a colour, so it reads without colour vision and
 * so Okay and Good — which share the teal — stay distinguishable:
 * Rough = square, Mixed = diamond, Okay = ring, Good = dot.
 */
export default function MoodMark({ mood, size = 10 }) {
	const box = { width: size, height: size };

	if (mood === 'Rough') {
		return <View className="rounded-[2px] bg-accent" style={box} />;
	}
	if (mood === 'Mixed') {
		// A square turned 45°, shrunk so its corners stay inside the box.
		const side = Math.round(size * 0.72);
		return (
			<View className="items-center justify-center" style={box}>
				<View
					className="rounded-[1px] bg-warn"
					style={{ width: side, height: side, transform: [{ rotate: '45deg' }] }}
				/>
			</View>
		);
	}
	if (mood === 'Okay') {
		return <View className="rounded-full border-2 border-calm" style={box} />;
	}
	return <View className="rounded-full bg-calm" style={box} />;
}
