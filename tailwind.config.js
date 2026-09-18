/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{js,jsx}'],
	darkMode: 'class',
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: {
				ink: '#2e2721',
				'ink-muted': '#73675d',
				'ink-faint': '#a39990',
				accent: '#d9682d',
				hairline: '#e0d4c5',
				surface: 'rgba(255, 255, 255, 0.65)',
				'aura-outer': '#fbf6ec',
				// Error state, from "W3 Log in — error" (node 248:73).
				danger: '#bd382e',
				'danger-surface': '#faecea',
				// Home dashboard (node 178:2).
				calm: '#4d8a81',
				warn: '#f2b42e',
				avatar: '#f5f1e9',
				insight: '#e7f1ee',
				'on-accent-muted': '#ffe8db',
				// Onboarding (nodes 16:2 - 17:68).
				'insight-ink': '#2b524d',
				// Log out confirm sheet (node 274:45).
				scrim: 'rgba(46, 39, 33, 0.45)',
			},
			borderRadius: {
				control: '14px',
				mark: '4px',
				// Log in screen (node 248:2).
				field: '12px',
				button: '13px',
				banner: '10px',
				// Home dashboard (node 178:2).
				pill: '17px',
				day: '11px',
				chip: '10px',
				tile: '12px',
				icon: '8px',
				dot: '5px',
				progress: '3px',
				sheet: '20px',
				// Check-in flow (nodes 22:16, 22:20).
				prompt: '18px',
				tag: '20px',
				// Journal empty state panel (node 27:87).
				card: '16px',
			},
			borderWidth: {
				// Focused and error field outlines (nodes 248:60, 248:90).
				1.5: '1.5px',
				1.6: '1.6px',
			},
			fontFamily: {
				inter: ['Inter_400Regular'],
				'inter-medium': ['Inter_500Medium'],
				'inter-semibold': ['Inter_600SemiBold'],
				'inter-bold': ['Inter_700Bold'],
			},
			// nativewind's dynamic `calc(var(--spacing) * N)` scale doesn't exist in
			// Tailwind v3 — these are the specific fractional multiples the Figma
			// frames need, on the standard N * 0.25rem unit (rem pinned to 16px in
			// metro.config.js). A Tailwind-aware formatter rewrites `px-[26px]` to
			// `px-6.5` on save, so every step used must be defined here or it
			// silently compiles to nothing.
			spacing: {
				0.75: '0.1875rem',
				1.25: '0.3125rem',
				1.75: '0.4375rem',
				2.25: '0.5625rem',
				2.5: '0.625rem',
				2.75: '0.6875rem',
				3.25: '0.8125rem',
				3.75: '0.9375rem',
				4.5: '1.125rem',
				5.5: '1.375rem',
				6.5: '1.625rem',
				7.5: '1.875rem',
				7.75: '1.9375rem',
				8.5: '2.125rem',
				13.5: '3.375rem',
				29: '7.25rem',
			},
		},
	},
	plugins: [],
};
