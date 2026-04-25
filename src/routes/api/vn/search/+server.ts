import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import { getCachedSearch, setCachedSearch } from '$lib/utils/cache';
import { weservUrl } from '$lib/utils/image';
import type { SearchResult } from '$lib/types';

const searchQuerySchema = z.object({
	q: z.string().min(1).max(200)
});

const VNDB_ENDPOINT = 'https://api.vndb.org/kana/vn';

export const GET: RequestHandler = async ({ url, platform }) => {
	const parseResult = searchQuerySchema.safeParse(Object.fromEntries(url.searchParams));
	if (!parseResult.success) {
		error(400, { message: 'Invalid query parameter' });
	}
	const { q } = parseResult.data;

	const cached = await getCachedSearch(platform?.env as Env, 'visual-novel', q, 1);
	if (cached) return json(cached);

	const response = await fetch(VNDB_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			filters: ['search', '=', q],
			fields: 'id, title, alttitle, image.url, image.thumbnail, released, developers.name',
			results: 24,
			page: 1
		})
	});

	if (!response.ok) {
		error(502, { message: 'VNDB API error' });
	}

	const data = await response.json() as {
		results?: Array<{
			id: string;
			title: string;
			alttitle?: string;
			image?: { url?: string; thumbnail?: string };
			released?: string;
			developers?: Array<{ name?: string }>;
		}>;
	};

	const vns = data.results ?? [];

	const results: SearchResult[] = vns.map((item) => {
		const image = item.image?.url ?? '';
		return {
			id: `vndb_${item.id}`,
			source: 'vndb',
			title: item.title,
			altTitle: item.alttitle,
			imageUrl: weservUrl(image, 400),
			thumbnailUrl: weservUrl(image, 150),
			originalImageUrl: image,
			metadata: {
				releaseDate: item.released,
				publisher: item.developers?.[0]?.name
			}
		};
	});

	await setCachedSearch(platform?.env as Env, 'visual-novel', q, results, 1);
	return json(results);
};
