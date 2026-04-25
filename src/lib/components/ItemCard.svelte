<script lang="ts">
	import type { SearchResult } from '$lib/types';

	let {
		item,
		onAdd,
		disabled = false
	}: {
		item: SearchResult;
		onAdd: (item: SearchResult) => void;
		disabled?: boolean;
	} = $props();
	let imgSrc = $derived(item.thumbnailUrl);
	let fallbackSrc = $state<string | null>(null);

	function handleAdd() {
		if (!disabled) onAdd(item);
	}

	function handleError() {
		fallbackSrc = item.originalImageUrl ?? item.thumbnailUrl;
	}
</script>

<article class="item-card">
	<img src={fallbackSrc ?? imgSrc} alt={item.title} loading="lazy" width="150" onerror={handleError} />
	<h3>{item.title}</h3>
	{#if item.altTitle}
		<p>{item.altTitle}</p>
	{/if}
	<button onclick={handleAdd} {disabled} type="button">Add to List</button>
</article>