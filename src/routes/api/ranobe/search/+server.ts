import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import { getCachedSearch, setCachedSearch } from '$lib/utils/cache';
import { weservUrl } from '$lib/utils/image';
import type { SearchResult } from '$lib/types';

const searchQuerySchema = z.object({
	q: z.string().min(1).max(200)
});

const RANOBEDB_ENDPOINT = 'https://ranobedb.org/api/v0';

export const GET: RequestHandler = async ({ url, platform }) => {
	const parseResult = searchQuerySchema.safeParse(Object.fromEntries(url.searchParams));
	if (!parseResult.success) {
		error(400, { message: 'Invalid query parameter' });
	}
	const { q } = parseResult.data;

	let cached;
	try {
		cached = await getCachedSearch(platform?.env as Env, 'light-novel', q, 1);
		if (cached) return json(cached);
	} catch (e) {
		console.error('Cache read error:', e);
	}

	let results: SearchResult[];
	try {
		const [booksRes, seriesRes] = await Promise.all([
			fetch(`${RANOBEDB_ENDPOINT}/books?q=${encodeURIComponent(q)}&limit=12&page=1`, {
				headers: { 'Accept': 'application/json' }
			}),
			fetch(`${RANOBEDB_ENDPOINT}/series?q=${encodeURIComponent(q)}&limit=12&page=1`, {
				headers: { 'Accept': 'application/json' }
			})
		]);

		const booksData = booksRes.ok ? (await booksRes.json() as { books?: Array<unknown> }) : { books: [] };
		const seriesData = seriesRes.ok ? (await seriesRes.json() as { series?: Array<unknown> }) : { series: [] };

		const books = (booksData.books ?? []) as Array<{
			id: number;
			romaji?: string;
			title?: string;
			title_orig?: string;
			c_release_date?: number;
			image?: { filename?: string } | null;
		}>;

		const series = (seriesData.series ?? []) as Array<{
			id: number;
			romaji?: string;
			title?: string;
			title_orig?: string;
			c_release_date?: number;
			image?: { filename?: string } | null;
		}>;

		const allItems = [...books, ...series];
		results = allItems.map((item) => {
			const imageFilename = item.image?.filename ?? '';
			const imageUrl = imageFilename ? `https://images.ranobedb.org/${imageFilename}` : '';
			return {
				id: `ranobe_${item.id}`,
				source: 'ranobe',
				title: item.romaji ?? item.title ?? String(item.id),
				altTitle: item.title_orig ?? item.title ?? undefined,
				imageUrl: weservUrl(imageUrl, 400),
				thumbnailUrl: weservUrl(imageUrl, 150),
				originalImageUrl: imageUrl,
				metadata: {
					releaseDate: item.c_release_date ? String(item.c_release_date) : undefined
				}
			};
		});
	} catch (e) {
		console.error('[ranobe] fetch error:', e instanceof Error ? e.message : String(e));
		error(502, { message: 'Failed to connect to RanobeDB API' });
	}

	try {
		await setCachedSearch(platform?.env as Env, 'light-novel', q, results, 1);
	} catch (e) {
		console.error('Cache write error:', e);
	}
	return json(results);
};
