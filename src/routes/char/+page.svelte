<script lang="ts">
	import { ListCreator } from '$lib/components';
	import { listStore, searchStore } from '$lib/stores';
	import { onMount } from 'svelte';

	onMount(() => {
		listStore.reset('character');
		searchStore.reset();
	});
</script>

<ListCreator category="character" placeholder="Search character..." />
