const palette = require('./src/theme/palette');

/**
 * Design tokens. Spacing uses Tailwind's default scale only — keep values on
 * the 4pt grid (1 = 4pt, 2 = 8pt…). Off-scale steps like `px-6.5` don't exist
 * and compile to nothing, so a typo shows up as missing spacing.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
	content: ['./src/**/*.{js,jsx}'],
	// Required even though the app is light-only and uses no `dark:` classes:
	// NativeWind's runtime sets the colour scheme itself, which throws on load
	// ("Cannot manually set color scheme") under the default 'media' mode.
	darkMode: 'class',
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			// Colours by role — values live in src/theme/palette.js.
			colors: palette,

			// The type scale. Each style carries its own line height, so screens
			// never set `leading-*`.
			fontSize: {
				hero: ['72px', { lineHeight: '80px' }],
				display: ['36px', { lineHeight: '44px' }],
				'large-title': ['28px', { lineHeight: '34px' }],
				title: ['24px', { lineHeight: '30px' }],
				'title-sm': ['20px', { lineHeight: '26px' }],
				headline: ['18px', { lineHeight: '24px' }],
				'body-lg': ['16px', { lineHeight: '23px' }],
				body: ['15px', { lineHeight: '21px' }],
				callout: ['14px', { lineHeight: '20px' }],
				subhead: ['13px', { lineHeight: '18px' }],
				footnote: ['12px', { lineHeight: '17px' }],
				caption: ['11px', { lineHeight: '15px' }],
			},

			// The spaced capitals above card content (`Eyebrow`).
			letterSpacing: {
				eyebrow: '0.8px',
			},

			// Each weight is its own font file in React Native, so the weight is
			// part of the family name.
			fontFamily: {
				inter: ['Inter_400Regular'],
				'inter-medium': ['Inter_500Medium'],
				'inter-semibold': ['Inter_600SemiBold'],
				'inter-bold': ['Inter_700Bold'],
			},

			// Four corner radii, plus Tailwind's `rounded-full` for pills and bars.
			// These override Tailwind's own sm/md/lg/xl.
			borderRadius: {
				sm: '8px',
				md: '12px',
				lg: '16px',
				xl: '20px',
			},
		},
	},
	plugins: [],
};
