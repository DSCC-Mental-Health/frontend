import { Pressable, Text } from 'react-native';

/**
 * Box and label classes per tone.
 *
 * White text on the brand orange (3.5:1) and on teal (4.0:1) only passes the
 * contrast minimum as bold text, so those labels are bold; dark labels on
 * light fills can stay semibold.
 */
const TONES = {
	primary: {
		box: 'bg-accent active:opacity-85',
		label: 'font-inter-bold text-white',
	},
	secondary: {
		box: 'border border-hairline bg-white active:opacity-80',
		label: 'font-inter-semibold text-ink',
	},
	danger: {
		box: 'bg-danger active:opacity-85',
		label: 'font-inter-bold text-white',
	},
	/** Destructive but not final: "Delete this entry", "Discard writing". */
	dangerOutline: {
		box: 'border border-danger bg-white active:opacity-80',
		label: 'font-inter-semibold text-danger',
	},
	calm: {
		box: 'bg-calm active:opacity-85',
		label: 'font-inter-bold text-white',
	},
	/** Completion moments: "Enter Steady", "Back to home". */
	warn: {
		box: 'bg-warn active:opacity-85',
		label: 'font-inter-semibold text-ink',
	},
	/** On the dark breathing screen. */
	onDark: {
		box: 'border-1.5 border-breath-outline active:opacity-70',
		label: 'font-inter-semibold text-white',
	},
};

const DISABLED = {
	box: 'bg-hairline',
	label: 'font-inter-semibold text-ink-faint',
};

/** Full-width button used across the app. `busy` swaps in `busyLabel` and disables it. */
export default function Button({
	label,
	onPress,
	tone = 'primary',
	disabled = false,
	busy = false,
	busyLabel,
	/** 'link' when it opens another screen rather than acting, e.g. the privacy page. */
	role = 'button',
}) {
	const live = !disabled && !busy;
	const look = live ? TONES[tone] : DISABLED;

	return (
		<Pressable
			accessibilityRole={role}
			accessibilityState={{ disabled: !live, busy }}
			disabled={!live}
			onPress={onPress}
			className={`w-full items-center justify-center overflow-hidden rounded-lg px-4 py-4 ${look.box}`}
		>
			<Text className={`text-body-lg ${look.label}`}>
				{busy && busyLabel ? busyLabel : label}
			</Text>
		</Pressable>
	);
}
