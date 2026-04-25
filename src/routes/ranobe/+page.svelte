<script lang="ts">
	import { ListCreator } from '$lib/components';
	import { listStore, searchStore } from '$lib/stores';
	import { onMount } from 'svelte';

	onMount(() => {
		listStore.reset('light-novel');
		searchStore.reset();
	});
</script>

<ListCreator category="light-novel" placeholder="Search light novel..." />
