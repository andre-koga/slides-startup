<script lang="ts">
// Styles
import '../app.css';

// Layouts
import Header from '$layout/Header.svelte';
import Sidebar from '$layout/Sidebar.svelte';

// Fonts
import '@fontsource/inter';

// Stores
import { theme } from '$stores/themeStore.js';
</script>

<div
	class:bg-light={$theme == 'light'}
	class:bg-dark={$theme == 'dark'}
	class="bg-[#E4E9EB] font-text text-black dark:bg-[#0C1117] dark:text-white"
>
	<Header />

	<div class="flex">
		<Sidebar />

		<main class="relative z-0 min-h-screen">
			<slot />
		</main>
	</div>

	<!-- <Footer /> -->
</div>
