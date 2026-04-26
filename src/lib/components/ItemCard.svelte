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
		<h3 class="font-body text-sm font-medium truncate">{item.title}</h3>
		{#if item.altTitle}
			<p class="font-body text-xs text-[var(--color-muted)] truncate">{item.altTitle}</p>
		{/if}
	</div>
</div>