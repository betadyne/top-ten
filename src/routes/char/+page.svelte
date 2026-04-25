<script lang="ts">
	import { ListCreator } from '$lib/components';
	import { listStore } from '$lib/stores';
	import { onMount } from 'svelte';

	onMount(() => {
		listStore.reset('character');
	});
</script>

<ListCreator category="character" placeholder="Search character..." />
