<script lang="ts">
// Slideshow functionality
import type { Slideshow } from '$lib/types';
import { processMarkup } from '$lib/parser';

// UI Components
import TextEditor from '$ui/TextEditor.svelte';

// Constants
import { EXAMPLE_TEXT } from '$constants';
import SlidesView from '$ui/SlidesView.svelte';

let TEXT = EXAMPLE_TEXT;

// Process the text into a slideshow
let slideshow: Slideshow = processMarkup(TEXT);

function handleTextareaInput(event: CustomEvent) {
	TEXT = event.detail.TEXT;
	slideshow = processMarkup(TEXT);
}
</script>

<div class="relative grid grid-cols-2 items-stretch gap-1 overflow-hidden">
	<TextEditor TEXT={TEXT} on:textareaInput={handleTextareaInput} />

	<SlidesView slideshow={slideshow} />
</div>
