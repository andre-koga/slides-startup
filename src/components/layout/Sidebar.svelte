<script lang="ts">
// Icons
import SidebarButton from '$ui/SidebarButton.svelte';
import { Eye, GitBranch } from 'lucide-svelte';

const SIDEBAR_TABS = [
	{
		name: 'Slides',
		icon: Eye
	},
	{
		name: 'Git',
		icon: GitBranch
	}
];

function handleTabSelected(event: CustomEvent) {
	chosenTab = event.detail.tabID;
}

let chosenTab = 0;
</script>

<sidebar>
	<tabs class="mx-auto grid grid-cols-2 overflow-hidden rounded text-sm">
		{#each SIDEBAR_TABS as tab, index}
			<SidebarButton
				tabID={index}
				isActive={chosenTab === index}
				on:tabSelected={handleTabSelected}
			>
				<svelte:component this={tab.icon} class="mx-auto h-5 w-5" />
				<span class="hidden lg:inline-block">{tab.name}</span>
			</SidebarButton>
		{/each}
	</tabs>
	<content class="mx-1 my-4 block md:mx-2 lg:mx-4">
		<!-- FIND A BETTER WAY TO DYNAMICALLY SHOW CONTENT {#if chosenTab === 0}
			<div>
				<h2 class="my-2 text-xs font-semibold uppercase">Slides</h2>
				<p class="text-sm">This is the slides tab</p>
			</div>
		{:else}
			<div>
				<h2 class="my-2 text-xs font-semibold uppercase">Git</h2>
				<p class="text-sm">This is the git tab</p>
			</div>
		{/if} -->
	</content>
</sidebar>
