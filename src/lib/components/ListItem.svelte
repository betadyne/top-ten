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

<li
	class="grid grid-cols-[60px_60px_1fr_auto] gap-4 items-center py-4 px-4 border-b border-[var(--color-border)] last:border-b-0 {sortable.isDragging ? 'opacity-50' : ''}"
	data-rank={item.rank}
	{@attach sortable.attach}
>
	<span class="font-display text-4xl font-bold text-[var(--color-muted)] text-center leading-none">{item.rank}</span>
	<img
		src={fallbackSrc ?? imgSrc}
		alt={item.title}
		loading="lazy"
		width="60"
		class="w-[60px] h-[80px] object-cover border border-[var(--color-border)]"
		onerror={handleError}
	/>
	<div class="min-w-0">
		<h4 class="font-body text-base font-medium truncate">{item.title}</h4>
		{#if item.category === 'anime' && item.metadata?.studio}
		<p class="text-editorial-label mt-1">{item.metadata.studio}</p>
	{:else if item.category === 'visual-novel' && (item.metadata?.developer ?? item.metadata?.publisher)}
		<p class="text-editorial-label mt-1">{item.metadata.developer ?? item.metadata.publisher}</p>
	{:else if item.category === 'character' && item.metadata?.voiceActor}
		<p class="text-editorial-label mt-1">CV: {item.metadata.voiceActor}</p>
	{:else if item.category === 'light-novel' && item.metadata?.author}
		<p class="text-editorial-label mt-1">{item.metadata.author}</p>
	{/if}
	</div>
	<button
		onclick={handleRemove}
		type="button"
		aria-label="Remove {item.title}"
		class="text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors px-2"
	>
		✕
	</button>
</li>