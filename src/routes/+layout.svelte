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
	class="bg-[#E4E9EB] font-text text-black dark:bg-[#0C1117] dark:text-white h-screen overflow-hidden"
>
	<Header />

	<div class="flex h-full">
		<Sidebar />

		<main class="relative z-0 h-full w-full">
			<slot />
		</main>
	</div>

	<!-- <Footer /> -->
</div>
