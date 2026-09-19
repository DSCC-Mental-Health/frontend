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
				// Darkened from #a39990 (2.6:1 on cream) to pass 4.5:1 as text.
				'ink-faint': '#786c62',
				accent: '#d9682d',
				// Orange for text. #d9682d is 3.3:1 on cream, below the 4.5:1 small
				// text needs, so fills keep `accent` and text uses this (4.8:1).
				'accent-text': '#b3501c',
				// Same value as a surface: the Home check-in card, so white text on it
				// passes 4.5:1 (5.2:1) where the button orange gives 3.5:1.
				'accent-strong': '#b3501c',
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
				// Insights weekly summary card (node 175:12).
				'insight-tag': 'rgba(255, 255, 255, 0.14)',
				'insight-label': '#c7dbd6',
				'insight-body': '#d9e5e3',
				'insight-meta': '#adc7c2',
				// Breathing player (node 33:2).
				// Raised from 0.1 / 0.16 so the rings you breathe with read as layers.
				'breath-ring-outer': 'rgba(255, 255, 255, 0.16)',
				'breath-ring-inner': 'rgba(255, 255, 255, 0.28)',
				'breath-count': 'rgba(255, 255, 255, 0.7)',
				'breath-outline': 'rgba(255, 255, 255, 0.5)',
				'breath-meta': '#c7d6d1',
				'breath-hint': '#b8c9c4',
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
