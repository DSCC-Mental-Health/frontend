import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Top and bottom padding for a screen: the frame's own padding, or the device
 * inset plus a small gap when that's larger (notch, home indicator).
 *
 * Most frames use 56pt at the top (M1, M3, M4, N1, N3, L1); the defaults match.
 */
export default function useScreenPadding({
	top = 56,
	topGap = 12,
	bottom = 0,
	bottomGap = 0,
} = {}) {
	const insets = useSafeAreaInsets();
	const padding = { paddingTop: Math.max(top, insets.top + topGap) };
	// Only when asked for, so it never overrides a screen's own bottom padding.
	if (bottom || bottomGap) padding.paddingBottom = Math.max(bottom, insets.bottom + bottomGap);
	return padding;
}
