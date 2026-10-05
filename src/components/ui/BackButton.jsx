import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

const backIcon = require('@/assets/images/back.svg');

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
