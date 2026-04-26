<script lang="ts">
	import type { Category, SearchResult } from '$lib/types';
	import { searchStore, listStore } from '$lib/stores';
	import { searchByCategory } from '$lib/utils/api';
	import { SearchBar, ItemCard, ListItem } from '$lib/components';
	import { get } from 'svelte/store';
	import { DragDropProvider } from '@dnd-kit/svelte';
	import type { DragEndEvent } from '@dnd-kit/abstract';

	let { category, placeholder }: { category: Category; placeholder: string } = $props();

	const categoryLabels: Record<Category, string> = {
		anime: 'Anime',
		character: 'Character',
		'light-novel': 'Light Novel',
		'visual-novel': 'Visual Novel'
	};

	async function handleSearch(query: string) {
		if (!query.trim()) {
			searchStore.reset();
			return;
		}
		searchStore.setLoading(true);
		searchStore.setError(null);
		try {
			const results = await searchByCategory(category, query);
			searchStore.setResults(results);
		} catch (err) {
			searchStore.setError(err instanceof Error ? err.message : 'Search failed');
		}
	}

	function handleAdd(item: SearchResult) {
		listStore.addItem({
			...item,
			category,
			rank: 0,
			metadata: item.metadata ?? {}
		});
	}

	function handleRemove(id: string) {
		listStore.removeItem(id);
	}

	function handleDragEnd(event: DragEndEvent) {
		if (event.canceled) return;
		const sourceId = event.operation?.source?.id;
		const target = event.operation?.target;
		if (!sourceId || !target) return;

		const targetIndex = (target as unknown as { index: number }).index;
		const items = get(listStore).items;
		const sourceIndex = items.findIndex((i) => i.id === sourceId);
		if (sourceIndex === -1 || sourceIndex === targetIndex) return;

		const newItems = arrayMove(items, sourceIndex, targetIndex);
		listStore.reorderItems(newItems);
	}

	function arrayMove<T>(arr: T[], from: number, to: number): T[] {
		const result = [...arr];
		const [removed] = result.splice(from, 1);
		result.splice(to, 0, removed);
		return result;
	}
</script>

<div class="list-creator">
	<div class="list-creator-left">
		<fieldset>
			<legend>Search</legend>
			<SearchBar {placeholder} onSearch={handleSearch} />
		</fieldset>

		{#if $searchStore.loading}
			<p class="loading-msg">Loading...</p>
		{:else if $searchStore.error}
			<p class="error-msg-inline">{$searchStore.error}</p>
		{:else if $searchStore.results.length > 0}
			<section class="results-section">
				<div class="section-header">Results</div>
				<div class="search-results-scroll">
					<div class="search-results">
						{#each $searchStore.results as result (result.id)}
							<ItemCard
								item={result}
								onAdd={handleAdd}
								disabled={$listStore.items.length >= 10 || $listStore.items.some((i) => i.id === result.id)}
							/>
						{/each}
					</div>
				</div>
			</section>
		{:else}
			<div class="list-creator-placeholder">
				<p class="list-preview-empty">Search and click results to add them</p>
			</div>
		{/if}
	</div>

	<div class="list-creator-right">
	{#if $listStore.items.length > 0}
		<DragDropProvider onDragEnd={handleDragEnd}>
			<div class="list-preview">
				<div class="list-preview-title">
					{$listStore.title.trim() || `Top 10 ${categoryLabels[category]}`}
				</div>
				<ol class="selections-list">
					{#each $listStore.items as item, index (item.id)}
						<ListItem {item} {index} onRemove={handleRemove} />
					{/each}
				</ol>
				<div class="list-watermark">
					This list was created by {$listStore.creatorName.trim() || 'Anonymous'}
				</div>
			</div>
		</DragDropProvider>
	{:else}
		<div class="list-preview">
			<div class="list-preview-title">
				{$listStore.title.trim() || `Top 10 ${categoryLabels[category]}`}
			</div>
			<p class="list-preview-empty">Your list will appear here</p>
		</div>
	{/if}

		<fieldset>
			<legend>Settings</legend>
			<label>
				List Title
				<input
					type="text"
					value={$listStore.title}
					oninput={(e) => listStore.setTitle(e.currentTarget.value)}
					maxlength="100"
					required
				/>
			</label>

			<label>
				Your Name (optional)
				<input
					type="text"
					value={$listStore.creatorName}
					oninput={(e) => listStore.setCreatorName(e.currentTarget.value)}
					maxlength="50"
				/>
			</label>

			<div class="action-buttons">
				<button type="button" disabled>Export Image</button>
				<button type="button" disabled>Copy Link</button>
			</div>
		</fieldset>
	</div>
</div>