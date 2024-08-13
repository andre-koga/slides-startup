/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ['selector', '[data-theme="dark"]'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				jet: ['JetBrains Mono', 'sans-serif'],
				text: ['Inter', 'sans-serif']
			}
		}
	},
	plugins: []
};
