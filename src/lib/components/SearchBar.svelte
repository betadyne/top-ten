<script lang="ts">
	let { onSearch, placeholder = 'Search...' }: { onSearch: (query: string) => void; placeholder?: string } = $props();

	let query = $state('');
	let timeout = $state<ReturnType<typeof setTimeout> | null>(null);

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		query = target.value;

		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => {
			onSearch(query);
		}, 300);
	}

	function handleSubmit(event: Event) {
		event.preventDefault();
		if (timeout) clearTimeout(timeout);
		onSearch(query);
	}
</script>

<form class="flex gap-3" onsubmit={handleSubmit}>
	<input
		type="search"
		value={query}
		oninput={handleInput}
		{placeholder}
		aria-label="Search"
		class="flex-1 bg-transparent border border-[var(--color-border)] rounded-none px-4 py-2 font-body text-sm placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
	/>
	<button
		type="submit"
		class="px-4 py-2 text-editorial-label hover:text-[var(--color-accent)] transition-colors border border-[var(--color-border)] hover:border-[var(--color-accent)]"
	>
		Search
	</button>
</form>