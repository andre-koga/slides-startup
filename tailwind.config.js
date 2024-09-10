/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ['selector', '[data-theme="dark"]'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		// colors: {

		// },
		extend: {
			fontFamily: {
				jet: ['JetBrains Mono', 'sans-serif'],
				text: ['Inter', 'sans-serif']
			},
			colors: {
				// 'slate-950': '#0C1117'
			}
		}
	},
	plugins: []
};
