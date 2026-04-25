import { writable } from 'svelte/store';
import type { SearchResult } from '$lib/types';

export interface SearchState {
	query: string;
	results: SearchResult[];
	loading: boolean;
	error: string | null;
}

function createSearchStore() {
	const { subscribe, set, update } = writable<SearchState>({
		query: '',
		results: [],
		loading: false,
		error: null
	});

	return {
		subscribe,
		set,
		update,
		setQuery: (query: string) => update((state) => ({ ...state, query })),
		setResults: (results: SearchResult[]) => update((state) => ({ ...state, results, loading: false })),
		setLoading: (loading: boolean) => update((state) => ({ ...state, loading })),
		setError: (error: string | null) => update((state) => ({ ...state, error, loading: false })),
		reset: () => set({ query: '', results: [], loading: false, error: null })
	};
}

export const searchStore = createSearchStore();
