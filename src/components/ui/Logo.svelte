<script lang="ts">
import '@fontsource/inter/800.css';

import black from '$assets/black-favicon.svg';
import white from '$assets/white-favicon.svg';
</script>

<black-logo class="logo flex dark:hidden">
	<img src={black} alt="Flux logo" />
	<h1>Flux</h1>
</black-logo>

<white-logo class="logo hidden dark:flex">
	<img src={white} alt="Flux logo" />
	<h1>Flux</h1>
</white-logo>

<style>
.logo {
	@apply items-center gap-1.5;
}
img {
	@apply w-6;
}
h1 {
	@apply text-xl font-extrabold;
}
</style>
