import { writable } from 'svelte/store';
import type { ListItem, TopTenList, Category } from '$lib/types';

export interface ListState {
	title: string;
	category: Category;
	items: ListItem[];
	creatorName: string;
	isPublic: boolean;
}

function createListStore() {
	const { subscribe, set, update } = writable<ListState>({
		title: '',
		category: 'anime',
		items: [],
		creatorName: '',
		isPublic: true
	});

	return {
		subscribe,
		set,
		update,
		addItem: (item: ListItem) =>
			update((state) => {
				if (state.items.length >= 10) return state;
				if (state.items.some((i) => i.id === item.id)) return state;
				const newItem = { ...item, rank: state.items.length + 1 };
				return { ...state, items: [...state.items, newItem] };
			}),
		removeItem: (id: string) =>
			update((state) => {
				const filtered = state.items.filter((i) => i.id !== id);
				const reordered = filtered.map((item, index) => ({ ...item, rank: index + 1 }));
				return { ...state, items: reordered };
			}),
		reorderItems: (items: ListItem[]) =>
			update((state) => {
				const reordered = items.map((item, index) => ({ ...item, rank: index + 1 }));
				return { ...state, items: reordered };
			}),
		reset: (category: Category) =>
			set({
				title: '',
				category,
				items: [],
				creatorName: '',
				isPublic: true
			}),
		setTitle: (title: string) => update((state) => ({ ...state, title })),
		setCreatorName: (name: string) => update((state) => ({ ...state, creatorName: name })),
		setIsPublic: (isPublic: boolean) => update((state) => ({ ...state, isPublic }))
	};
}

export const listStore = createListStore();
