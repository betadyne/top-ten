<script lang="ts">
	import type { ListItem } from '$lib/types';
	import { createSortable } from '@dnd-kit/svelte/sortable';

	let {
		item,
		index,
		onRemove
	}: {
		item: ListItem;
		index: number;
		onRemove: (id: string) => void;
	} = $props();

	const sortable = createSortable({ id: item.id, index });

	$effect(() => {
		sortable.sortable.index = index;
	});

	let imgSrc = $derived(item.thumbnailUrl);
	let fallbackSrc = $state<string | null>(null);

	function handleRemove() {
		onRemove(item.id);
	}

	function handleError() {
		fallbackSrc = item.originalImageUrl ?? item.thumbnailUrl;
	}
</script>

<li class="list-item" class:dragging={sortable.isDragging} data-rank={item.rank} {@attach sortable.attach}>
	<span class="drag-handle" {@attach sortable.attachHandle}>⋮⋮</span>
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