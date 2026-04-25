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

	function handleClick() {
		if (!disabled) onAdd(item);
	}

	function handleError() {
		fallbackSrc = item.originalImageUrl ?? item.thumbnailUrl;
	}
</script>

<div class="item-card" class:disabled onclick={handleClick} role="button" tabindex="0" onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}>
	<img src={fallbackSrc ?? imgSrc} alt={item.title} loading="lazy" width="60" onerror={handleError} />
	<div class="item-card-info">
		<h3>{item.title}</h3>
		{#if item.altTitle}
			<p>{item.altTitle}</p>
		{/if}
	</div>
</div>