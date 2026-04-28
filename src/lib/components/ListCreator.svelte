<script lang="ts">
    import type { Category, SearchResult } from "$lib/types";
    import { searchStore, listStore } from "$lib/stores";
    import { searchByCategory } from "$lib/utils/api";
    import { SearchBar, ItemCard, ListItem } from "$lib/components";
    import { get } from "svelte/store";
    import { DragDropProvider } from "@dnd-kit/svelte";
    import type { DragEndEvent } from "@dnd-kit/abstract";

    let { category, placeholder }: { category: Category; placeholder: string } =
        $props();

    const categoryLabels: Record<Category, string> = {
        anime: "Anime",
        character: "Character",
        "light-novel": "Light Novel",
        "visual-novel": "Visual Novel",
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
            searchStore.setError(
                err instanceof Error ? err.message : "Search failed",
            );
        }
    }

    function handleAdd(item: SearchResult) {
        listStore.addItem({
            ...item,
            category,
            rank: 0,
            metadata: item.metadata ?? {},
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

<div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_1.5fr] gap-8">
    <div class="flex flex-col gap-6">
        <section>
            <h2 class="text-editorial-label mb-3">Search</h2>
            <SearchBar {placeholder} onSearch={handleSearch} />
        </section>

        {#if $searchStore.loading}
            <p class="text-sm text-[var(--color-muted)]">Loading...</p>
        {:else if $searchStore.error}
            <p class="text-sm text-[var(--color-accent)]">
                {$searchStore.error}
            </p>
        {:else if $searchStore.results.length > 0}
            <section>
                <h3 class="text-editorial-label mb-3">Results</h3>
                <div class="overflow-y-auto max-h-[60vh]">
                    <div class="flex flex-col gap-3">
                        {#each $searchStore.results as result (result.id)}
<ItemCard
								item={result}
								onAdd={handleAdd}
								disabled={$listStore.items.length >= 10 ||
									$listStore.items.some(
										(i) => i.id === result.id,
									)}
								{category}
							/>
                        {/each}
                    </div>
                </div>
            </section>
        {:else}
            <p class="text-sm text-[var(--color-muted)] text-center py-8">
                Search and click results to add them
            </p>
        {/if}
    </div>

    <div class="flex flex-col gap-8">
        {#if $listStore.items.length > 0}
            <DragDropProvider onDragEnd={handleDragEnd}>
                <div class="stepped-frame p-6">
                    <h2
                        class="font-display text-xl font-bold uppercase tracking-tight text-center py-6"
                    >
                        {$listStore.title.trim() ||
                            `My Top 10 ${categoryLabels[category]}`}
                    </h2>
                    <div class="editorial-divider mb-6"></div>
                    <ol class="flex flex-col gap-2">
                        {#each $listStore.items as item, index (item.id)}
                            <ListItem {item} {index} onRemove={handleRemove} />
                        {/each}
                    </ol>
                    <div
                        class="text-[0.6rem] text-[var(--color-muted)] text-center mt-6"
                    >
                        This list was created by {$listStore.creatorName.trim() ||
                            "Anonymous"}
                    </div>
                </div>
            </DragDropProvider>
        {:else}
            <div class="stepped-frame p-6">
                <h2
                    class="font-display text-xl font-bold uppercase tracking-tight text-center py-6"
                >
                    {$listStore.title.trim() ||
                        `My Top 10 ${categoryLabels[category]}`}
                </h2>
                <div class="editorial-divider mb-6"></div>
                <p class="text-sm text-[var(--color-muted)] text-center py-8">
                    Your list will appear here
                </p>
            </div>
        {/if}

        <section>
            <h2 class="text-editorial-label mb-4">Settings</h2>
            <div class="flex flex-col gap-4">
                <label class="flex flex-col gap-1">
                    <span class="text-editorial-label">List Title</span>
                    <input
                        type="text"
                        value={$listStore.title}
                        oninput={(e) =>
                            listStore.setTitle(e.currentTarget.value)}
                        maxlength="100"
                        required
                        class="bg-transparent border border-[var(--color-border)] rounded-none px-3 py-2 font-body text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors w-full"
                    />
                </label>

                <label class="flex flex-col gap-1">
                    <span class="text-editorial-label"
                        >Your Name (optional)</span
                    >
                    <input
                        type="text"
                        value={$listStore.creatorName}
                        oninput={(e) =>
                            listStore.setCreatorName(e.currentTarget.value)}
                        maxlength="50"
                        class="bg-transparent border border-[var(--color-border)] rounded-none px-3 py-2 font-body text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors w-full"
                    />
                </label>

                <div class="flex gap-3 mt-2">
                    <button
                        type="button"
                        disabled
                        class="px-4 py-2 text-xs uppercase tracking-widest border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Export Image
                    </button>
                    <button
                        type="button"
                        disabled
                        class="px-4 py-2 text-xs uppercase tracking-widest border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Copy Link
                    </button>
                </div>
            </div>
        </section>
    </div>
</div>
