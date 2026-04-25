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
			name?: string;
			translated_title?: string;
			image?: string;
			release_date?: string;
			publisher?: { name?: string };
			status?: string;
		}>;

		const series = (seriesData.series ?? []) as Array<{
			id: number;
			name?: string;
			translated_title?: string;
			image?: string;
			release_date?: string;
			publisher?: { name?: string };
			status?: string;
		}>;

		const allItems = [...books, ...series];
		results = allItems.map((item) => {
			const image = item.image ?? '';
			return {
				id: `ranobe_${item.id}`,
				source: 'ranobe',
				title: item.translated_title ?? item.name ?? String(item.id),
				altTitle: item.name ?? undefined,
				imageUrl: weservUrl(image, 400),
				thumbnailUrl: weservUrl(image, 150),
				originalImageUrl: image,
				metadata: {
					releaseDate: item.release_date,
					publisher: item.publisher?.name,
					status: item.status
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
