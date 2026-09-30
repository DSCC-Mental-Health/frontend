import { Pressable, Text } from 'react-native';

/**
 * Label classes per variant.
 * - nav: header actions (Close, Back, Cancel, Skip, Search)
 * - navStrong: the header's confirming action (Save)
 * - navAccent: a back link named after where it goes (R3's "Insights")
 * - navLight: header actions on the dark breathing screen
 * - small: secondary actions inside a card (Clear)
 * - link / linkStrong: orange inline links (See all, Forgot password?)
 */
const VARIANTS = {
	nav: 'font-inter-medium text-callout text-ink-muted',
	navStrong: 'font-inter-semibold text-callout text-accent-text',
	navAccent: 'font-inter-medium text-callout text-accent-text',
	navLight: 'font-inter-medium text-callout text-white',
	small: 'font-inter-medium text-footnote text-ink-muted',
	link: 'font-inter-medium text-subhead text-accent-text',
	linkStrong: 'font-inter-semibold text-subhead text-accent-text',
};

const DISABLED = 'font-inter-medium text-callout text-ink-faint';

/**
 * A text-only button. Text this size is only ~16–17pt tall, so the touch area
 * is extended 14pt on every side to reach Apple's 44pt minimum.
 */
export default function TextButton({
	label,
	onPress,
	variant = 'nav',
	disabled = false,
	role = 'button',
	accessibilityLabel,
	accessibilityState,
	className = '',
}) {
	return (
		<Pressable
			accessibilityRole={role}
			accessibilityLabel={accessibilityLabel}
			accessibilityState={{ disabled, ...accessibilityState }}
			disabled={disabled}
			onPress={onPress}
			hitSlop={14}
			className={`active:opacity-60 ${className}`}
		>
			<Text className={disabled ? DISABLED : VARIANTS[variant]}>{label}</Text>
		</Pressable>
	);
}
