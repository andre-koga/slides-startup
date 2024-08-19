<script lang="ts">
import { processMarkup } from '$lib/parser';
import { generateHTML } from '$lib/htmlGenerator';
import { tick } from 'svelte';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';
	import type { Slideshow } from '$lib/types';

let textareas = [
	`template=test.template
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
- \$1 + 1 = 2\$`
];

let slideshows: Slideshow[] = textareas.map(markup => processMarkup(markup));

  const onInput = (index: number) => {
    slideshows[index] = processMarkup(textareas[index]);
    console.log(slideshows[index]);
  };

  const onKeyPress = (event: any, index: number) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      textareas.splice(index + 1, 0, '');
      slideshows.splice(index + 1, 0, processMarkup(''));
		tick();
	  let newTextArea = document.getElementById(`textarea-${index + 1}`)
	  if (newTextArea) {
		newTextArea.focus();
	  }
    }
  };
</script>

<div class="relative grid grid-cols-2 items-stretch gap-1 overflow-hidden p-1">
	<div class="flex flex-col">
		{#each textareas as markup, index}
		<!-- <numbers
			class="grid place-content-start rounded-l-md bg-[#F3F8F9] py-2 pl-4 pr-2 font-jet text-sm text-gray-400 dark:bg-[#141B20] dark:text-slate-600"
		>
			{#each [...Array(100).keys()] as number}
				<div class="text-end">{number}</div>
			{/each}
		</numbers> -->
		<textarea
          id={`textarea-${index}`}
          bind:value={textareas[index]}
          on:input={() => onInput(index)}
          on:keypress={(event) => onKeyPress(event, index)}
          class="h-[1.5em] leading-[1.5em] resize-none overflow-y-scroll rounded-r-md font-jet text-sm dark:bg-gray-800 dark:text-slate-300"
        ></textarea>
		{/each}
	</div>
	<div class="flex h-[calc(100vh-3.5rem)] flex-col gap-1 overflow-y-scroll text-black">
		{#each slideshows as slideshow}
			{#each slideshow.slides as slide}
			<div class="aspect-video rounded bg-white p-2">
				<div class="aspect-video overflow-hidden">
					{@html generateHTML(slide)}
				</div>
			</div>
			{/each}
		{/each}
	</div>
</div>

<style>
textarea {
	font-variant-ligatures: none;
}
</style>
