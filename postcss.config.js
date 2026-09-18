/**
 * Tailwind has to compile `src/global.css` before nativewind's css-interop
 * turns the result into React Native styles — its Metro transformer delegates
 * to Expo's worker (which runs PostCSS) to get plain CSS first.
 */
module.exports = {
	plugins: {
		tailwindcss: {},
		autoprefixer: {},
	},
};
