<script lang="ts">
	import { ListCreator } from '$lib/components';
	import { listStore } from '$lib/stores';
	import { onMount } from 'svelte';

	onMount(() => {
		listStore.reset('anime');
	});
</script>

<ListCreator category="anime" placeholder="Search anime..." />
