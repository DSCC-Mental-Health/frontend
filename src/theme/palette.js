/**
 * The app's colours, named by role. The one place a hex value is written:
 * tailwind.config.js turns these into classes (`bg-canvas`, `text-ink-muted`),
 * and src/constants/colors.js re-exports them for props that need a plain
 * colour (placeholder text, icon tints, the Settings switch).
 *
 * CommonJS so tailwind.config.js (run by Node) can `require` it.
 *
 * Translucent colours aren't listed: use Tailwind's opacity modifier on the
 * base colour, e.g. `bg-white/15`, `border-white/50`, `bg-ink/45` (the scrim).
 */
module.exports = {
	// Text. ink-faint was darkened from #a39990 to pass 4.5:1 as text.
	ink: '#2e2721',
	'ink-muted': '#73675d',
	'ink-faint': '#786c62',

	// Surfaces.
	canvas: '#fbf6ec',
	'surface-muted': '#f5f1e9',
	'calm-surface': '#e7f1ee',
	'danger-surface': '#faecea',

	// Brand. `accent` is for fills; it's 3.3:1 on canvas, so text and the Home
	// check-in card use `accent-strong` (4.8:1 as text, 5.2:1 under white).
	accent: '#d9682d',
	'accent-strong': '#b3501c',

	// Status and mood: Rough = accent, Mixed = warn, Okay/Good = calm.
	calm: '#4d8a81',
	'calm-strong': '#2b524d',
	warn: '#f2b42e',
	danger: '#bd382e',

	// Lines.
	hairline: '#e0d4c5',

	// Text on the dark teal (`calm-strong`) surfaces: the Insights summary card
	// and the breathing player. 6.7:1 and 5.0:1 on calm-strong.
	'on-dark': '#d9e5e3',
	'on-dark-muted': '#b8c9c4',
};
