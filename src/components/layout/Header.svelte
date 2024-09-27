<script lang="ts">
// Icons
import { Sun, Moon, Share2, FileText } from 'lucide-svelte';

// Store to transmit button
import { writable } from 'svelte/store';

// Stores
import { theme } from '$stores/themeStore.js';
import Logo from '$ui/Logo.svelte';

import { pdfStore } from '$lib/stores';

// Function to toggle the theme
function toggleTheme() {
	theme.update((current) => {
		const newTheme = current === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', newTheme);
		return newTheme;
	});
}

function onExport() {
	console.log("EXPORT");
	pdfStore.update((x) => x + 1); // trigger subscribers
}
</script>

<header class="flex h-12 items-stretch gap-2 bg-slate-100 px-6 py-2 dark:bg-slate-900">
	<a class="place-self-center" href="/">
		<Logo />
	</a>
	<divider class="flex-grow"></divider>
	<button class="button" on:click={onExport}> <FileText class="block h-4"/></button>
	<button class="button"> <Share2 class="block h-4" /></button>
	<button
		on:click={toggleTheme}
		class="rounded-lg bg-amber-400 px-2 dark:bg-indigo-800"
		aria-label="Toggle theme"
	>
		<Sun class="block h-4 dark:hidden" />
		<Moon class="hidden h-4 dark:block" />
	</button>
</header>

<style>
.button {
	@apply rounded-lg border border-[#626C76] border-opacity-50 px-2 text-[#626C76] hover:bg-[#626C76] hover:bg-opacity-20 dark:border-[#8C96A0] dark:border-opacity-50 dark:text-[#8C96A0];
}
</style>
