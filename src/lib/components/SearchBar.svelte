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

<form class="search-form" onsubmit={handleSubmit}>
	<input
		type="search"
		value={query}
		oninput={handleInput}
		{placeholder}
		aria-label="Search"
	/>
	<button type="submit">Search</button>
</form>