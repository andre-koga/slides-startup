<script lang="ts">
import { Eye, GitBranch } from 'lucide-svelte';

function setTab(tab: number) {
	enabledTab = tab;
}

let enabledTab = 0;
</script>

<sidebar class="block p-1 pr-0">
	<tabs class="mx-auto grid grid-cols-2 rounded bg-[#e5e9ea] text-sm dark:bg-[#151B20]">
		<button
			on:click={() => setTab(0)}
			class="rounded-l p-1 hover:bg-white dark:hover:bg-[#1E2936] {enabledTab == 0 ? "active" : "inactive"}"
			><Eye class="mx-auto h-5 w-5" /><span class="hidden lg:inline-block">View</span></button
		>
		<button
			on:click={() => setTab(1)}
			class="rounded-r p-1 hover:bg-white dark:hover:bg-[#1E2936] {enabledTab == 1 ? "active" : "inactive"}"
			><GitBranch class="mx-auto h-5 w-5" /><span class="hidden lg:inline-block">Git</span></button
		>
	</tabs>
	<content class="mx-1 my-4 block md:mx-2 lg:mx-4">
		{#if enabledTab === 0}
			<div>
				<h2 class="my-2 text-xs font-semibold uppercase">Slides</h2>
				<p class="text-sm">This is the slides tab</p>
			</div>
		{:else}
			<div>
				<h2 class="my-2 text-xs font-semibold uppercase">Git</h2>
				<p class="text-sm">This is the git tab</p>
			</div>
		{/if}
	</content>
</sidebar>

<style>
.active {
	@apply bg-white text-black dark:bg-[#1E2936] dark:text-white;
}

.inactive {
	@apply bg-[#F4F8F9] text-gray-500 dark:bg-[#151B20] dark:text-gray-400;
}
</style>
