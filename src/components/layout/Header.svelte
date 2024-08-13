<script lang="ts">
// Icons
import { Sun, Moon } from 'lucide-svelte';

// Stores
import { theme } from '$stores/themeStore.js';

// Function to toggle the theme
function toggleTheme() {
	theme.update((current) => {
		const newTheme = current === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', newTheme);
		return newTheme;
	});
}
</script>

<header>
	<button
		on:click={toggleTheme}
		class="text-lighttext dark:text-darktext place-self-end rounded-lg bg-amber-400 p-1 transition-transform hover:scale-95 sm:p-1.5 dark:bg-indigo-800"
		aria-label="Toggle theme"
	>
		<Sun class="block h-5 w-5 dark:hidden" />
		<Moon class="hidden h-5 w-5 dark:block" />
	</button>
</header>
