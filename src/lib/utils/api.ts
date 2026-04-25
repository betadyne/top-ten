import type { SearchResult, Category } from '$lib/types';

export async function searchAnime(query: string): Promise<SearchResult[]> {
	const response = await fetch(`/api/anime/search?q=${encodeURIComponent(query)}`);
	if (!response.ok) throw new Error('Failed to search anime');
	return response.json();
}

export async function searchCharacter(query: string): Promise<SearchResult[]> {
	const response = await fetch(`/api/char/search?q=${encodeURIComponent(query)}`);
	if (!response.ok) throw new Error('Failed to search character');
	return response.json();
}

export async function searchRanobe(query: string): Promise<SearchResult[]> {
	const response = await fetch(`/api/ranobe/search?q=${encodeURIComponent(query)}`);
	if (!response.ok) throw new Error('Failed to search light novel');
	return response.json();
}

export async function searchVN(query: string): Promise<SearchResult[]> {
	const response = await fetch(`/api/vn/search?q=${encodeURIComponent(query)}`);
	if (!response.ok) throw new Error('Failed to search visual novel');
	return response.json();
}

const searchFunctions: Record<Category, (query: string) => Promise<SearchResult[]>> = {
	anime: searchAnime,
	character: searchCharacter,
	'light-novel': searchRanobe,
	'visual-novel': searchVN
};

export async function searchByCategory(category: Category, query: string): Promise<SearchResult[]> {
	const fn = searchFunctions[category];
	if (!fn) throw new Error(`Unknown category: ${category}`);
	return fn(query);
}

export async function createList(listData: {
	title: string;
	category: Category;
	items: { id: string; source: string; rank: number; title: string; altTitle?: string; imageUrl: string; metadata?: string }[];
	creatorName?: string;
	isPublic: boolean;
}): Promise<{ id: string }> {
	const response = await fetch('/api/list', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(listData)
	});
	if (!response.ok) {
		const errData = await response.json() as { message?: string };
		throw new Error(errData.message || 'Failed to create list');
	}
	return response.json();
}

export async function getList(id: string): Promise<unknown> {
	const response = await fetch(`/api/list/${id}`);
	if (!response.ok) throw new Error('Failed to get list');
	return response.json();
}
