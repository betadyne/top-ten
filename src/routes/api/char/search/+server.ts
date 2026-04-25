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
const VNDB_ENDPOINT = 'https://api.vndb.org/kana/character';

const SEARCH_CHARACTER_QUERY = `
  query SearchCharacter($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage }
      characters(search: $search) {
        id
        name { full native }
        image { medium large }
        media(page: 1, perPage: 1) {
          nodes { title { romaji } }
        }
      }
    }
  }
`;

async function searchAniListCharacters(q: string): Promise<SearchResult[]> {
	const response = await fetch(ANILIST_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: SEARCH_CHARACTER_QUERY,
			variables: { search: q, page: 1, perPage: 12 }
		})
	});

	if (!response.ok) return [];

	const data = await response.json() as {
		data?: {
			Page?: {
				characters?: Array<{
					id: number;
					name: { full?: string; native?: string };
					image?: { medium?: string; large?: string };
					media?: { nodes?: Array<{ title?: { romaji?: string } }> };
				}>;
			};
		};
	};

	const characters = data.data?.Page?.characters ?? [];
	return characters.map((item) => {
		const image = item.image?.large ?? item.image?.medium ?? '';
		return {
			id: `anilist_${item.id}`,
			source: 'anilist',
			title: item.name.full ?? String(item.id),
			altTitle: item.name.native ?? undefined,
			imageUrl: weservUrl(image, 400),
			thumbnailUrl: weservUrl(image, 150),
			originalImageUrl: image,
			metadata: {
				sourceName: item.media?.nodes?.[0]?.title?.romaji
			}
		};
	});
}

async function searchVNDBCharacters(q: string): Promise<SearchResult[]> {
	const response = await fetch(VNDB_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			filters: ['search', '=', q],
			fields: 'id, name, original, image.url, vns.title',
			results: 12,
			page: 1
		})
	});

	if (!response.ok) return [];

	const data = await response.json() as {
		results?: Array<{
			id: string;
			name: string;
			original?: string;
			image?: { url?: string };
			vns?: Array<{ title?: string }>;
		}>;
	};

	const characters = data.results ?? [];
	return characters.map((item) => {
		const image = item.image?.url ?? '';
		return {
			id: `vndb_${item.id}`,
			source: 'vndb',
			title: item.name,
			altTitle: item.original ?? undefined,
			imageUrl: weservUrl(image, 400),
			thumbnailUrl: weservUrl(image, 150),
			originalImageUrl: image,
			metadata: {
				sourceName: item.vns?.[0]?.title
			}
		};
	});
}

export const GET: RequestHandler = async ({ url, platform }) => {
	const parseResult = searchQuerySchema.safeParse(Object.fromEntries(url.searchParams));
	if (!parseResult.success) {
		error(400, { message: 'Invalid query parameter' });
	}
	const { q } = parseResult.data;

	const cached = await getCachedSearch(platform?.env as Env, 'character', q, 1);
	if (cached) return json(cached);

	const [anilistResults, vndbResults] = await Promise.all([
		searchAniListCharacters(q),
		searchVNDBCharacters(q)
	]);

	const results = [...anilistResults, ...vndbResults];
	await setCachedSearch(platform?.env as Env, 'character', q, results, 1);
	return json(results);
};
