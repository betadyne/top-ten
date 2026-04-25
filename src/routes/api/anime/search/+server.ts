import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import { getCachedSearch, setCachedSearch } from '$lib/utils/cache';
import { weservUrl } from '$lib/utils/image';
import type { SearchResult } from '$lib/types';

const searchQuerySchema = z.object({
	q: z.string().min(1).max(200)
});

const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

const SEARCH_ANIME_QUERY = `
  query SearchAnime($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage }
      media(search: $search, type: ANIME) {
        id
        title { romaji english native }
        coverImage { medium large }
        season
        seasonYear
        format
        episodes
      }
    }
  }
`;

export const GET: RequestHandler = async ({ url, platform }) => {
	const parseResult = searchQuerySchema.safeParse(Object.fromEntries(url.searchParams));
	if (!parseResult.success) {
		error(400, { message: 'Invalid query parameter' });
	}
	const { q } = parseResult.data;

	const cached = await getCachedSearch(platform?.env as Env, 'anime', q, 1);
	if (cached) return json(cached);

	const response = await fetch(ANILIST_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: SEARCH_ANIME_QUERY,
			variables: { search: q, page: 1, perPage: 24 }
		})
	});

	if (!response.ok) {
		error(502, { message: 'AniList API error' });
	}

	const data = await response.json() as {
		data?: {
			Page?: {
				media?: Array<{
					id: number;
					title: { romaji?: string; english?: string; native?: string };
					coverImage?: { medium?: string; large?: string };
					season?: string;
					seasonYear?: number;
					format?: string;
					episodes?: number;
				}>;
			};
		};
	};

	const media = data.data?.Page?.media ?? [];

	const results: SearchResult[] = media.map((item) => {
		const image = item.coverImage?.large ?? item.coverImage?.medium ?? '';
		return {
			id: `anilist_${item.id}`,
			source: 'anilist',
			title: item.title.english ?? item.title.romaji ?? item.title.native ?? String(item.id),
			altTitle: item.title.native ?? item.title.romaji ?? undefined,
			imageUrl: weservUrl(image, 400),
			thumbnailUrl: weservUrl(image, 150),
			originalImageUrl: image,
			metadata: {
				episodes: item.episodes,
				season: item.season,
				year: item.seasonYear,
				format: item.format
			}
		};
	});

	await setCachedSearch(platform?.env as Env, 'anime', q, results, 1);
	return json(results);
};
