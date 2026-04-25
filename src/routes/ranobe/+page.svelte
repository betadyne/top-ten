<script lang="ts">
	import { ListCreator } from '$lib/components';
	import { listStore } from '$lib/stores';
	import { onMount } from 'svelte';

	onMount(() => {
		listStore.reset('light-novel');
	});
</script>

<ListCreator category="light-novel" placeholder="Search light novel..." />
