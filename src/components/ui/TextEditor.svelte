<script lang="ts">
import { createEventDispatcher } from 'svelte';

export let TEXT: string = '';
let lines = TEXT.split('\n');

const dispatch = createEventDispatcher();

function handleTextareaInput(event: Event) {
	let target = event.target as HTMLTextAreaElement;
	let TEXT = target.value;

	// Update the lines array
	lines = TEXT.split('\n');

	dispatch('textareaInput', { TEXT });
}
</script>

<text-editor
	class="relative flex flex-col overflow-hidden rounded border-4 border-slate-300 bg-slate-50 font-jet dark:border-slate-700 dark:bg-slate-800"
>
	<textarea
		bind:value={TEXT}
		on:input={handleTextareaInput}
		class="absolute bottom-0 left-12 right-0 top-0 z-50 bg-transparent pl-1.5 pr-1.5 pt-[0.5rem] font-jet text-sm text-transparent caret-black hover:outline-none focus:outline-none active:border-none dark:caret-slate-200"
	></textarea>

	<!-- is this really the best way?? -->
	<div class="absolute left-0 z-10 h-full w-12 bg-slate-300 dark:bg-slate-700" />

	<!-- <Highlight language={typescript} code={code} /> -->
	<!-- for each line in lines, generate a line with a number on the left side displaying the index + 1 -->
	<div class="z-20 pt-2">
		{#each lines as line, index}
			<div class="editor-line grid items-stretch font-jet" id={`line-${index}`}>
				<div class="editor-line-number mx-2 text-right text-slate-500">{index + 1}</div>
				<div class="editor-line-text px-1.5 dark:text-slate-200">{line}</div>
			</div>
		{/each}
	</div>
</text-editor>

<style>
.editor-line-number,
.editor-line-text {
	@apply text-sm;
}
.editor-line-text {
	@apply text-slate-900 dark:text-slate-300;
}
.editor-line {
	grid-template-columns: 3rem 1fr;
}
textarea::-moz-selection {
	/* Code for Firefox */
	@apply bg-slate-300;
}

textarea::selection {
	@apply bg-slate-300 text-black dark:bg-slate-700 dark:text-white;
}
</style>
