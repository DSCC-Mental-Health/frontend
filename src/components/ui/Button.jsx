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
	/** A destructive choice among others, e.g. "Discard writing". */
	secondaryDanger: {
		box: 'border border-hairline bg-white active:opacity-80',
		label: 'font-inter-semibold text-danger',
	},
	danger: {
		box: 'bg-danger active:opacity-85',
		label: 'font-inter-bold text-white',
	},
	/** The first, softer step towards deleting, e.g. "Delete this entry". */
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

const SIZES = {
	/** Screen-level actions (L1, I1–I8, W1): 16pt label. */
	lg: { box: 'py-4', label: 'text-[16px]' },
	/** In-content and sheet actions (M1, M3, N2, N3): 15pt label. */
	md: { box: 'py-3.75', label: 'text-[15px]' },
};

/**
 * Full-width button used across the app. `busy` swaps in `busyLabel` and
 * disables it; `radius="button"` is the log in form's 13px corner (W1).
 */
export default function Button({
	label,
	onPress,
	tone = 'primary',
	size = 'lg',
	disabled = false,
	busy = false,
	busyLabel,
	radius = 'control',
	/** 'link' when it opens another screen rather than acting, e.g. the privacy page. */
	role = 'button',
	accessibilityLabel,
}) {
	const live = !disabled && !busy;
	const look = live ? TONES[tone] : DISABLED;

	return (
		<Pressable
			accessibilityRole={role}
			accessibilityLabel={accessibilityLabel}
			accessibilityState={{ disabled: !live, busy }}
			disabled={!live}
			onPress={onPress}
			className={`w-full items-center justify-center overflow-hidden px-4 ${
				radius === 'button' ? 'rounded-button' : 'rounded-control'
			} ${SIZES[size].box} ${look.box}`}
		>
			<Text className={`${SIZES[size].label} ${look.label}`}>
				{busy && busyLabel ? busyLabel : label}
			</Text>
		</Pressable>
	);
}
