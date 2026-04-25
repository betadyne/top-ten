import type { SearchResult } from '$lib/types';
import { weservUrl } from '$lib/utils/image';

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

export async function searchAniListAnime(query: string): Promise<SearchResult[]> {
	const response = await fetch(ANILIST_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
		body: JSON.stringify({
			query: SEARCH_ANIME_QUERY,
			variables: { search: query, page: 1, perPage: 24 }
		})
	});

	if (!response.ok) {
		throw new Error(`AniList API error: ${response.status} ${response.statusText}`);
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
		errors?: Array<{ message: string }>;
	};

	if (data.errors) {
		console.error('AniList GraphQL errors:', data.errors);
	}

	const media = data.data?.Page?.media ?? [];
	return media.map((item) => {
		const image = item.coverImage?.large ?? item.coverImage?.medium ?? '';
		return {
			id: `anilist_${item.id}`,
			source: 'anilist' as const,
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
}

export async function searchAniListCharacters(query: string): Promise<SearchResult[]> {
	const response = await fetch(ANILIST_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
		body: JSON.stringify({
			query: SEARCH_CHARACTER_QUERY,
			variables: { search: query, page: 1, perPage: 12 }
		})
	});

	if (!response.ok) {
		throw new Error(`AniList API error: ${response.status} ${response.statusText}`);
	}

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
		errors?: Array<{ message: string }>;
	};

	if (data.errors) {
		console.error('AniList GraphQL errors:', data.errors);
	}

	const characters = data.data?.Page?.characters ?? [];
	return characters.map((item) => {
		const image = item.image?.large ?? item.image?.medium ?? '';
		return {
			id: `anilist_${item.id}`,
			source: 'anilist' as const,
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