<script lang="ts">
import { processMarkup } from '$lib/parser';
import { generateHTML } from '$lib/htmlGenerator';
import { tick } from 'svelte';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';
import type { Slideshow } from '$lib/types';

let text = [
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

let lines = text[0].split('\n');

const keyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
	// prevent default
	event.preventDefault();
      const index = parseInt((event.target as HTMLElement).id.split('-')[1]);
      lines = [...lines.slice(0, index + 1), '', ...lines.slice(index + 1)];
	  tick();
	  // focus on the new line
	  const newLine = document.getElementById(`line-${index + 1}`);
	  if (newLine) newLine.focus();
    }
  };
</script>

<div class="relative grid grid-cols-2 items-stretch gap-1 overflow-hidden p-1">
	<text-editor class="rounded-lg text-sm bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-slate-300 dark:border-slate-700 flex flex-col font-jet">
		<div class="editor-line grid grid-cols-2 h-2">
			<number class="bg-slate-300 dark:bg-slate-700 pr-2 pl-4 text-right"></number>
			<div id="line-first" role="textbox">
				
			</div>
		</div>
		{#each lines as lineText, i}
		<div class="editor-line grid grid-cols-2">
			<number class="bg-slate-300 select-none dark:bg-slate-700 pr-2 pl-4 text-right dark:text-slate-500 text-slate-400 font-semibold">{i + 1}</number>
			<div contenteditable="true" on:keypress={keyPress} id="line-{i}" role="textbox" tabindex="0" class="focus:bg-slate-200 dark:focus:bg-slate-900 px-1.5 dark:text-slate-200 {lineText.substring(0, 3) == "---" ? "text-red-600 dark:text-red-500" : ""}">
				{lineText}
			</div>
		</div>
		{/each}
		<div class="editor-line grid grid-cols-2 flex-grow">
			<number class="bg-slate-300 dark:bg-slate-700 pr-2 pl-4 text-right"></number>
			<div id="line-last" role="textbox">
				
			</div>
		</div>
	</text-editor>
	<slides-view class="flex h-[calc(100vh-3.5rem)] flex-col gap-1 overflow-y-scroll text-black">
		<!-- for now idk how to generate the slides -->
		<!-- {#each slideshows as slideshow}
			{#each slideshow.slides as slide}
			<div class="aspect-video rounded bg-white p-2">
				<div class="aspect-video overflow-hidden">
					{@html generateHTML(slide)}
				</div>
			</div>
			{/each}
		{/each} -->
		</slides-view>
</div>

<style>
	[contenteditable]:focus {
		outline: none;
	}
.editor-line {
	grid-template-columns: 3rem 1fr;
}
line {
	font-variant-ligatures: none;
}
</style>
