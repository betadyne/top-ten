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
      characters(search: $search, sort: [SEARCH_MATCH, FAVOURITES_DESC]) {
        id
        name { full native }
        image { medium large }
        media(perPage: 1) {
          edges {
            voiceActors(language: JAPANESE) {
              name { full }
            }
          }
        }
      }
    }
  }
`;

async function searchAniListCharacters(q: string): Promise<SearchResult[]> {
	try {
		const response = await fetch(ANILIST_ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
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
						media?: { edges?: Array<{ voiceActors?: Array<{ name?: { full?: string } }> }> };
					}>;
				};
			};
			errors?: Array<{ message: string }>;
		};

		if (data.errors) {
			throw new Error('AniList GraphQL error: ' + data.errors[0].message);
		}

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
					voiceActor: item.media?.edges?.[0]?.voiceActors?.[0]?.name?.full
				}
			};
		});
	} catch (e) {
		console.error('[char] AniList fetch error:', e instanceof Error ? e.message : String(e));
		return [];
	}
}

async function searchVNDBCharacters(q: string): Promise<SearchResult[]> {
	try {
		const response = await fetch(VNDB_ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
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
	} catch (e) {
		console.error('[char] VNDB fetch error:', e instanceof Error ? e.message : String(e));
		return [];
	}
}

export const GET: RequestHandler = async ({ url, platform }) => {
	const parseResult = searchQuerySchema.safeParse(Object.fromEntries(url.searchParams));
	if (!parseResult.success) {
		error(400, { message: 'Invalid query parameter' });
	}
	const { q } = parseResult.data;

	let cached;
	try {
		cached = await getCachedSearch(platform?.env as Env, 'character', q, 1);
		if (cached) return json(cached);
	} catch (e) {
		console.error('Cache read error:', e);
	}

	let results: SearchResult[];
	try {
		const [anilistResults, vndbResults] = await Promise.all([
			searchAniListCharacters(q),
			searchVNDBCharacters(q)
		]);
		results = [...anilistResults, ...vndbResults];
	} catch (e) {
		console.error('[char] fetch error:', e instanceof Error ? e.message : String(e));
		error(502, { message: 'Failed to fetch character data' });
	}

	try {
		await setCachedSearch(platform?.env as Env, 'character', q, results, 1);
	} catch (e) {
		console.error('Cache write error:', e);
	}
	return json(results);
};
