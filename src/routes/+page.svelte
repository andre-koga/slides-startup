<script lang="ts">
// Slideshow functionality
import type { Slideshow } from '$lib/types';
import { processMarkup } from '$lib/parser';

// UI Components
import TextEditor from '$ui/TextEditor.svelte';

// Constants
import { EXAMPLE_TEXT } from '$constants';
import SlidesView from '$ui/SlidesView.svelte';
import { onMount } from 'svelte';
import { generateHTML } from '$lib/htmlGenerator';

// Store
import { pdfStore } from '$lib/stores';

let html2pdf;


onMount(async () => {
	const module = await import('html2pdf.js');
	html2pdf = module.default;
})

let TEXT = EXAMPLE_TEXT;

// Process the text into a slideshow
let slideshow: Slideshow = processMarkup(TEXT);

export function generatePdf() {
	let out = `<div class="w-full h-[1100px] flex flex-col items-center bg-slate-950">`;
	for (const slide of slideshow.slides) {
		out += `<div class="w-[90%] h-[40%] border-2 border-black mt-[5%] bg-white p-2 rounded-lg">`;
		out += generateHTML(slide);
		out += `</div>`;
	}
	out += `</div>`;

	let elem = document.createElement('div');
	elem.innerHTML = out;

	html2pdf(elem);
}

pdfStore.subscribe((value) => {
	console.log(value);
	if (value > 0 && html2pdf) {
		generatePdf();
	}
})

function handleTextareaInput(event: CustomEvent) {
	TEXT = event.detail.TEXT;
	slideshow = processMarkup(TEXT);
}
</script>

<div class="relative grid grid-cols-2 items-stretch gap-1 overflow-hidden">
	<TextEditor TEXT={TEXT} on:textareaInput={handleTextareaInput} />

	<SlidesView slideshow={slideshow} />
</div>
