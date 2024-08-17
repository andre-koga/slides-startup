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
	class="bg-[#E4E9EB] font-text text-black dark:bg-[#0C1117] dark:text-white overflow-hidden h-screen"
>
	<Header />

	<div class="grid grid-cols-8">
		<Sidebar />

		<main class="col-span-7">
			<slot />
		</main>
	</div>

	<!-- <Footer /> -->
</div>
