import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

const backIcon = require('@/assets/images/back.svg');

/**
 * The arrow back button at the top of a pushed screen (W1, privacy, X1).
 *
 * Goes back through history, or to `fallback` when there's none (opened from a
 * link or after a reload). `onPress` replaces that for screens with their own
 * step-back, like the auth code step. 24pt icon + 12 each side = 48pt target.
 */
export default function BackButton({ onPress, fallback = '/' }) {
	const router = useRouter();

	function goBack() {
		if (router.canGoBack()) router.back();
		else router.replace(fallback);
	}

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel="Go back"
			onPress={onPress ?? goBack}
			hitSlop={12}
			className="self-start active:opacity-60"
		>
			<Image
				source={backIcon}
				style={{ width: 24, height: 24 }}
				contentFit="contain"
				accessibilityIgnoresInvertColors
			/>
		</Pressable>
	);
}
