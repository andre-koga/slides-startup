<script lang="ts">
    import { processMarkup } from "$lib/compiler";
	import { slide } from "svelte/transition";

    let markup = `Hello there\n---Slide 1\nNice to\nMeet you`;
    let slides : string[] = processMarkup(markup);

    const onInput = () => {
        slides = processMarkup(markup);
    } 
</script>

<h1>Flow</h1>
<textarea bind:value={markup} on:input={onInput} style="width: 200px; height: 200px; resize: none"/>
<div>
    {#each slides as slide}
        <div style="border: 1px solid black;">
            <p>{slide}</p>
        </div>
    {/each}
</div>