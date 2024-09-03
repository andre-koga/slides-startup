<script lang="ts">
import { processMarkup } from '$lib/parser';
import { generateHTML } from '$lib/htmlGenerator';
import { onMount, tick } from 'svelte';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';
import type { Slideshow } from '$lib/types';

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
- \$1 + 1 = 2\$`
;

let lines = initialText.split('\n');
  let cursorPosition = { top: 0, left: 0 };

function handleTextareaInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    initialText = target.value;
    lines = initialText.split('\n');
  }

  function checkCursorPosition(textarea: HTMLTextAreaElement) {
	const cursorIndex = textarea.value.slice(0, textarea.selectionStart).length;
	// position the cursor based on the cursorIndex
	const textBeforeCursor = textarea.value.slice(0, cursorIndex);
	const textBeforeCursorLines = textBeforeCursor.split('\n');
	const lastLine = textBeforeCursorLines[textBeforeCursorLines.length - 1];
	const lastLineIndex = textBeforeCursorLines.length - 1;
	const lastLineLength = lastLine.length;
	const lastLineIndexLength = lastLineIndex.toString().length;
	const lastLineIndexWidth = lastLineIndexLength * 8;
	const lastLineTextWidth = lastLineLength * 8;
	const cursorLeft = lastLineIndexWidth + lastLineTextWidth;
	const cursorTop = lastLineIndex * 20;

	const yOffset = 10;
	const xOffset = 46;
	cursorPosition = { top: cursorTop + yOffset, left: cursorLeft + xOffset };
  }

  function handleOnClick(event: MouseEvent) {
	const target = event.target as HTMLTextAreaElement;
	checkCursorPosition(target);
  }

  function handleKeyUp(event: KeyboardEvent) {
    const target = event.target as HTMLTextAreaElement;
    checkCursorPosition(target);
  }

  onMount(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      checkCursorPosition(textarea as HTMLTextAreaElement);
    }
  });

</script>

<div class="relative grid grid-cols-2 items-stretch gap-1 overflow-hidden p-1">
	<text-editor class="relative rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-slate-300 dark:border-slate-700 flex flex-col font-jet">
		
		<!-- make textarea cover the exact dimensions of the text-editor and make it invisible but still interactable -->
		<textarea bind:value={initialText} on:input={handleTextareaInput} on:keyup={handleKeyUp} on:click={handleOnClick} class="opacity-10 text-sm absolute pl-1.5 top-0 pr-1.5 font-jet pt-[0.5rem] bottom-0 left-12 right-0 text-black z-50"></textarea>

		<div class="fake-cursor" style="top: {cursorPosition.top}px; left: {cursorPosition.left}px;"></div>

		<div class="absolute left-0 h-full w-12 dark:bg-slate-600 z-10"/>
		 
		<!-- for each line in lines, generate a line with a number on the left side displaying the index + 1 -->
		<div class="pt-2 z-20">
		{#each lines as line, index}
			<div class="editor-line grid font-jet items-stretch" id={`line-${index}`}>
				<div class="editor-line-number dark:text-slate-400 dark:bg-slate-600 text-right px-2">{index + 1}</div>
				<div class="editor-line-text dark:text-slate-200 px-1.5">{line}</div>
			</div>
		{/each}
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
.editor-line-number, .editor-line-text {
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
</style>
