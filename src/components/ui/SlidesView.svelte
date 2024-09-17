<script lang="ts">
import { generateHTML } from '$lib/htmlGenerator';
import type { Slideshow } from '$lib/types';

export let slideshow: Slideshow;
</script>

<slides-view class="flex h-[calc(100vh-3.5rem)] flex-col gap-1 overflow-y-scroll text-black">
	{#each slideshow.slides as slide}
		<div class="aspect-video rounded bg-white p-2">
			<div class="aspect-video overflow-hidden">
				{@html generateHTML(slide)}
			</div>
		</div>
	{/each}
</slides-view>
