<script lang="ts">
import { processMarkup } from '$lib/parser';
import { generateHTML } from '$lib/htmlGenerator';
import { type Slideshow } from '$lib/types';

let markup = `template=test.template\n---Slide 1\n# A great day\nHello there\n---Slide 2\nAnother great day`;
let slideshow: Slideshow = processMarkup(markup);

const onInput = () => {
	slideshow = processMarkup(markup);
	console.log(slideshow);
};
</script>

<h1 class="">Flux</h1>
<textarea
	bind:value={markup}
	on:input={onInput}
	style="width: 200px; height: 200px; resize: none"
/>
<div>
	{#each slideshow.slides as slide}
		<div style="border: 1px solid black">
			{@html generateHTML(slide)}
		</div>
	{/each}
</div>

<div class="text-red-400">yey</div>
