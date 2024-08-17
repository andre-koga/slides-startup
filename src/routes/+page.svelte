<script lang="ts">
import { processMarkup } from '$lib/parser';
import { generateHTML } from '$lib/htmlGenerator';
import { type Slideshow } from '$lib/types';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';

let markup = `template=test.template
---Slide 1
# A **Great** Day
#### by *Me!*

Here's why it's so great:
- It's fantastic
- _and_
- Just great
---Slide 2
# My favorite equations
- \$e^{i\\pi} + 1 = 0\$
- \$\\int\\limits_{0}^{10}e^x = e^x\\Big|_{0}^{10} = e^{10} - 1\$
- \$1 + 1 = 2\$`;
let slideshow: Slideshow = processMarkup(markup);

const onInput = () => {
	slideshow = processMarkup(markup);
	console.log(slideshow);
};
</script>

<div class="relative grid grid-cols-2 items-stretch gap-1 p-1 overflow-hidden">
	<div class="flex overflow-y-scroll">
		<numbers class="grid font-jet dark:bg-[#141B20] text-gray-400 dark:text-slate-600 text-sm py-2 pl-4 pr-2 rounded-l-md bg-[#F3F8F9] place-content-start">
			{#each [...Array(100).keys()] as number}
				<div class="text-end ">{number}</div>
			{/each}
		</numbers>
		<textarea
		bind:value={markup}
		on:input={onInput}
		class="resize-none flex-grow h-[calc(100vh-3.5rem)] rounded-r-md font-jet text-sm p-2 dark:bg-gray-800 dark:text-slate-300"
		></textarea>
	</div>
	<div class="flex h-[calc(100vh-3.5rem)] flex-col text-black gap-1 overflow-y-scroll">
		{#each slideshow.slides as slide}
			<div class="aspect-video p-2 bg-white rounded">
				<div class="overflow-hidden aspect-video">
					{@html generateHTML(slide)}
				</div>
			</div>
		{/each}
		
	</div>
</div>

<style>
	textarea {
		font-variant-ligatures: none;
	}
</style>