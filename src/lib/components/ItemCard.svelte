<script lang="ts">
	import type { SearchResult, Category } from '$lib/types';

	let {
		item,
		onAdd,
		disabled = false,
		category
	}: {
		item: SearchResult;
		onAdd: (item: SearchResult) => void;
		disabled?: boolean;
		category: Category;
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

<div
	class="flex items-center gap-4 p-3 border border-transparent hover:border-[var(--color-border)] hover:bg-neutral-50 cursor-pointer transition-all {disabled ? 'opacity-40 cursor-not-allowed' : ''}"
	class:disabled
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
>
	<img
		src={fallbackSrc ?? imgSrc}
		alt={item.title}
		loading="lazy"
		width="50"
		class="w-[50px] h-[70px] object-cover border border-[var(--color-border)]"
		onerror={handleError}
	/>
	<div class="min-w-0 flex-1">
		<h3 class="font-body text-sm font-medium line-clamp-2 break-words">{item.title}</h3>
		{#if category === 'anime' && item.metadata?.studio}
			<p class="font-body text-xs text-[var(--color-muted)]">{item.metadata.studio}</p>
		{:else if category === 'visual-novel' && (item.metadata?.developer ?? item.metadata?.publisher)}
			<p class="font-body text-xs text-[var(--color-muted)]">{item.metadata.developer ?? item.metadata.publisher}</p>
		{:else if category === 'character' && item.metadata?.voiceActor}
			<p class="font-body text-xs text-[var(--color-muted)]">CV: {item.metadata.voiceActor}</p>
		{:else if category === 'light-novel' && item.metadata?.author}
			<p class="font-body text-xs text-[var(--color-muted)]">{item.metadata.author}</p>
		{/if}
	</div>
</div>