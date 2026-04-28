export type Category = 'anime' | 'character' | 'light-novel' | 'visual-novel';

export type Source = 'anilist' | 'vndb' | 'ranobe';

export interface ListItem {
	id: string;
	source: Source;
	category: Category;
	rank: number;
	title: string;
	altTitle?: string;
	imageUrl: string;
	thumbnailUrl: string;
	originalImageUrl: string;
	metadata: {
		episodes?: number;
		season?: string;
		year?: number;
		format?: string;
		sourceName?: string;
releaseDate?: string;
		publisher?: string;
		status?: string;
		studio?: string;
		developer?: string;
		voiceActor?: string;
		author?: string;
	};
}

export interface TopTenList {
	id: string;
	title: string;
	category: Category;
	createdAt: Date;
	updatedAt: Date;
	items: ListItem[];
	isPublic: boolean;
	creatorName?: string;
}

export interface SearchResult {
	id: string;
	source: Source;
	title: string;
	altTitle?: string;
	imageUrl: string;
	thumbnailUrl: string;
	originalImageUrl: string;
	metadata?: {
		episodes?: number;
		season?: string;
		year?: number;
		format?: string;
		sourceName?: string;
		releaseDate?: string;
		publisher?: string;
		status?: string;
		studio?: string;
		developer?: string;
		voiceActor?: string;
		author?: string;
	};
}
