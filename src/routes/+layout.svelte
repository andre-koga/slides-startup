<script lang="ts">
// Styles
import '../app.css';

// Layouts
import Header from '$layout/Header.svelte';
import Sidebar from '$layout/Sidebar.svelte';

// Fonts
import '@fontsource/inter';
import '@fontsource/jetbrains-mono';
import '@fontsource/jetbrains-mono';

// Stores
import { theme } from '$stores/themeStore.js';
</script>

<div
	class:bg-light={$theme == 'light'}
	class:bg-dark={$theme == 'dark'}
	class="h-screen overflow-hidden bg-slate-200 font-text text-black dark:bg-slate-950 dark:text-white"
>
	<Header />

	<div class="grid grid-cols-8 gap-1 p-1">
		<Sidebar />

		<main class="col-span-7">
			<slot />
		</main>
	</div>

	<!-- <Footer /> -->
</div>
