<script lang="ts">
	import { ListCreator } from '$lib/components';
	import { listStore } from '$lib/stores';
	import { onMount } from 'svelte';

	onMount(() => {
		listStore.reset('visual-novel');
	});
</script>

<ListCreator category="visual-novel" placeholder="Search visual novel..." />
