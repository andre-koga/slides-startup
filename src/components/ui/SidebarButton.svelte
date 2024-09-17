<script lang="ts">
import { createEventDispatcher } from 'svelte';

export let tabID: number = 0;
export let isActive: boolean = false;

const dispatch = createEventDispatcher();

function handleClick() {
	dispatch('tabSelected', { tabID });
}
</script>

<button on:click={handleClick} class="p-1 {isActive ? "active" : "inactive"}"><slot /> </button>

<style>
.active {
	@apply bg-slate-50 dark:bg-slate-800;
}

.inactive {
	@apply bg-slate-300 text-slate-500 dark:bg-slate-900 dark:text-slate-500;
}
</style>
