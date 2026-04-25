import type { SearchResult, Category } from '$lib/types';

export function getCacheKey(category: Category, query: string, page = 1): string {
	return `search:${category}:${query.toLowerCase().trim()}:${page}`;
}

export async function getCachedSearch(
	env: Env,
	category: Category,
	query: string,
	page = 1
): Promise<SearchResult[] | null> {
	try {
		const key = getCacheKey(category, query, page);
		const cached = await env.KV?.get(key);
		if (cached) {
			return JSON.parse(cached) as SearchResult[];
		}
	} catch {
		return null;
	}
	return null;
}

export async function setCachedSearch(
	env: Env,
	category: Category,
	query: string,
	results: SearchResult[],
	page = 1
): Promise<void> {
	try {
		const key = getCacheKey(category, query, page);
		await env.KV?.put(key, JSON.stringify(results), { expirationTtl: 600 });
	} catch {
		void 0;
	}
}
