<script lang="ts">
	import { ListCreator } from '$lib/components';
	import { listStore, searchStore } from '$lib/stores';
	import { onMount } from 'svelte';

	onMount(() => {
		listStore.reset('visual-novel');
		searchStore.reset();
	});
</script>

<ListCreator category="visual-novel" placeholder="Search visual novel..." />
