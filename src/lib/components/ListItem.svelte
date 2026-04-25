<script lang="ts">
	import type { ListItem } from '$lib/types';

	let {
		item,
		onRemove
	}: {
		item: ListItem;
		onRemove: (id: string) => void;
	} = $props();
	let imgSrc = $derived(item.thumbnailUrl);
	let fallbackSrc = $state<string | null>(null);

	function handleRemove() {
		onRemove(item.id);
	}

	function handleError() {
		fallbackSrc = item.originalImageUrl ?? item.thumbnailUrl;
	}
</script>

<li class="list-item" data-rank={item.rank}>
	<span class="list-item-rank">{item.rank}</span>
	<img src={fallbackSrc ?? imgSrc} alt={item.title} loading="lazy" width="60" onerror={handleError} />
	<div class="list-item-info">
		<h4>{item.title}</h4>
		{#if item.altTitle}
			<p>{item.altTitle}</p>
		{/if}
		<small>Source: {item.source}</small>
	</div>
	<button onclick={handleRemove} type="button" aria-label="Remove {item.title}">✕</button>
</li>