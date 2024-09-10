<script lang="ts">
import type { Slideshow } from '$lib/types';
import { processMarkup } from '$lib/parser';
import { generateHTML } from '$lib/htmlGenerator';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';

const code = 'const add = (a: number, b: number) => a + b;';

let initialText = `template=test.template

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
let lines = initialText.split('\n');

function handleTextareaInput(event: Event) {
	const target = event.target as HTMLTextAreaElement;
	initialText = target.value;
	lines = initialText.split('\n');
	slideshow = processMarkup(initialText);
}

let slideshow: Slideshow = processMarkup(initialText);
</script>

<div class="relative grid grid-cols-2 items-stretch gap-1 overflow-hidden p-1">
	<text-editor
		class="relative flex flex-col overflow-hidden rounded-lg border-4 border-slate-300 bg-slate-50 font-jet dark:border-slate-700 dark:bg-slate-800"
	>
		<!-- make textarea cover the exact dimensions of the text-editor and make it invisible but still interactable -->
		<textarea
			bind:value={initialText}
			on:input={handleTextareaInput}
			class="absolute bottom-0 left-12 right-0 top-0 z-50 bg-[#00000000] pl-1.5 pr-1.5 pt-[0.5rem] font-jet text-sm text-[#00000000] caret-black hover:outline-none focus:outline-none active:border-none dark:caret-slate-200"
		></textarea>

		<div class="absolute left-0 z-10 h-full w-12 bg-slate-300 dark:bg-slate-700" />

		<!-- <Highlight language={typescript} code={code} /> -->
		<!-- for each line in lines, generate a line with a number on the left side displaying the index + 1 -->
		<div class="z-20 pt-2">
			{#each lines as line, index}
				<div class="editor-line grid items-stretch font-jet" id={`line-${index}`}>
					<div class="editor-line-number px-2 text-right text-slate-500">{index + 1}</div>
					<div class="editor-line-text px-1.5 dark:text-slate-200">{line}</div>
				</div>
			{/each}
		</div>
	</text-editor>

	<slides-view class="flex h-[calc(100vh-3.5rem)] flex-col gap-1 overflow-y-scroll text-black">
		<!-- for now idk how to generate the slides -->
		{#each slideshow.slides as slide}
			<div class="aspect-video rounded bg-white p-2">
				<div class="aspect-video overflow-hidden">
					{@html generateHTML(slide)}
				</div>
			</div>
		{/each}
	</slides-view>
</div>

<style>
.editor-line-number,
.editor-line-text {
	@apply text-sm;
}
.editor-line {
	grid-template-columns: 3rem 1fr;
}
.fake-cursor {
	position: absolute;
	width: 1px;
	height: 16px; /* Adjust based on your line height */
	background-color: white;
	pointer-events: none;
}

textarea::-moz-selection {
	/* Code for Firefox */
	@apply bg-slate-300;
}

textarea::selection {
	@apply bg-slate-300 text-black dark:bg-slate-700 dark:text-white;
}
</style>
