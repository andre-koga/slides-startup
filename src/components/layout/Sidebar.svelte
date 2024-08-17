<script lang="ts">
    import {Eye, GitBranch } from 'lucide-svelte'

    function setTab(tab: number) {
        enabledTab = tab;
    }

    let enabledTab = 0;
</script>

<sidebar class="block p-1 pr-0">
    <tabs class="mx-auto bg-[#e5e9ea] dark:bg-[#151B20] rounded grid grid-cols-2 text-sm">
        <button on:click={() => setTab(0)} class="dark:hover:bg-[#1E2936] hover:bg-white p-1 rounded-l {enabledTab == 0 ? "active" : "inactive"}"><Eye class="mx-auto h-5 w-5"/><span class="hidden lg:inline-block">View</span></button>
        <button on:click={() => setTab(1)} class="dark:hover:bg-[#1E2936] hover:bg-white p-1 rounded-r {enabledTab == 1 ? "active" : "inactive"}"><GitBranch class="mx-auto h-5 w-5"/><span class="hidden lg:inline-block">Git</span></button>
    </tabs>
    <content class="block mx-1 md:mx-2 lg:mx-4 my-4">
        {#if enabledTab === 0}
            <div>
                <h2 class="text-xs my-2 font-semibold uppercase">Slides</h2>
                <p class="text-sm">This is the slides tab</p>
            </div>
        {:else}
           <div>
                <h2 class="text-xs my-2 font-semibold uppercase">Git</h2>
                <p class="text-sm">This is the git tab</p>
            </div>
        {/if}
    </content>
</sidebar>

<style>
    .active {
        @apply bg-white dark:bg-[#1E2936] text-black dark:text-white;
    }

    .inactive {
        @apply bg-[#F4F8F9] dark:bg-[#151B20] text-gray-500 dark:text-gray-400;
    }
</style>