<script lang="ts">
import { processMarkup } from '$lib/parser';
import { generateHTML } from '$lib/htmlGenerator';
import { type Slideshow } from '$lib/types';

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

<div class="w-full h-full flex flex-row overflow-hidden">
	<textarea
		bind:value={markup}
		on:input={onInput}
		class="basis-2/3 resize-none overflow-scroll p-5"
	/>
	<div class="basis-1/3 overflow-scroll">
		{#each slideshow.slides as slide}
			<div class="m-5 p-5 aspect-video border-2 border-black bg-white">
				{@html generateHTML(slide)}
			</div>
		{/each}
	</div>
</div>
