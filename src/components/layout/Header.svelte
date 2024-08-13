<script lang="ts">
// Icons
import { Sun, Moon, Share, Dot } from 'lucide-svelte';

// Stores
import { theme } from '$stores/themeStore.js';
import Logo from '$ui/Logo.svelte';

import '@fontsource/inter/500.css';

// Function to toggle the theme
function toggleTheme() {
	theme.update((current) => {
		const newTheme = current === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', newTheme);
		return newTheme;
	});
}
</script>

<header class="flex gap-2 bg-[#F5F8F9] px-6 py-2 dark:bg-[#161B20]">
	<Logo />
	<divider class="flex-grow"></divider>
	<button
		class="rounded-lg border border-[#626C76] px-2 text-[#626C76] dark:border-[#8C96A0] dark:text-[#8C96A0]"
	>
		<Share class="block h-4" /></button
	>
	<button
		on:click={toggleTheme}
		class="rounded-lg bg-amber-400 px-2 dark:bg-indigo-800"
		aria-label="Toggle theme"
	>
		<Sun class="block h-4 dark:hidden" />
		<Moon class="hidden h-4 dark:block" />
	</button>
</header>
