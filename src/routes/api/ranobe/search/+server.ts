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

	const cached = await getCachedSearch(platform?.env as Env, 'light-novel', q, 1);
	if (cached) return json(cached);

	const [booksRes, seriesRes] = await Promise.all([
		fetch(`${RANOBEDB_ENDPOINT}/books?q=${encodeURIComponent(q)}&limit=12&page=1`),
		fetch(`${RANOBEDB_ENDPOINT}/series?q=${encodeURIComponent(q)}&limit=12&page=1`)
	]);

	const booksData = booksRes.ok ? (await booksRes.json() as { data?: Array<unknown> }) : { data: [] };
	const seriesData = seriesRes.ok ? (await seriesRes.json() as { data?: Array<unknown> }) : { data: [] };

	const books = (booksData.data ?? []) as Array<{
		id: number;
		name?: string;
		translated_title?: string;
		image?: string;
		release_date?: string;
		publisher?: { name?: string };
		status?: string;
	}>;

	const series = (seriesData.data ?? []) as Array<{
		id: number;
		name?: string;
		translated_title?: string;
		image?: string;
		release_date?: string;
		publisher?: { name?: string };
		status?: string;
	}>;

	const allItems = [...books, ...series];
	const results: SearchResult[] = allItems.map((item) => {
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

	await setCachedSearch(platform?.env as Env, 'light-novel', q, results, 1);
	return json(results);
};
