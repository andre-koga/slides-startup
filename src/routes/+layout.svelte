<script lang="ts">
// Styles
import '../app.css';

// Layouts
import Header from '$layout/Header.svelte';

// Fonts
import '@fontsource/inter';

// Stores
import { theme } from '$stores/themeStore.js';
</script>

<div class:bg-light={$theme == 'light'} class:bg-dark={$theme == 'dark'}>
	<Header />

	<main
		class="relative z-0 min-h-screen bg-white font-text text-black dark:bg-black dark:text-white"
	>
		<slot />
	</main>

	<!-- <Footer /> -->
</div>
