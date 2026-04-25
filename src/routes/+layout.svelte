<script lang="ts">
	import '$lib/styles/global.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="layout-header">
	<h1><a href="/">Top 10 List Maker</a></h1>
</header>

<main class="layout-main">
	{@render children()}
</main>

<footer class="layout-footer">
	<p>Top 10 List Maker</p>
</footer>