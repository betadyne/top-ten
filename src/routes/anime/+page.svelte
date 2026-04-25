<script lang="ts">
	import { ListCreator } from '$lib/components';
	import { listStore, searchStore } from '$lib/stores';
	import { onMount } from 'svelte';

	onMount(() => {
		listStore.reset('anime');
		searchStore.reset();
	});
</script>

<ListCreator category="anime" placeholder="Search anime..." />
