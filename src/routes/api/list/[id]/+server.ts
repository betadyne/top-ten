import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { z } from 'zod';

const idSchema = z.string().uuid();

export const GET: RequestHandler = async ({ params, platform }) => {
	const parseResult = idSchema.safeParse(params.id);
	if (!parseResult.success) {
		error(400, { message: 'Invalid list ID' });
	}
	const id = parseResult.data;

	if (!platform) {
		console.error('[list/id] GET: platform object is missing');
		error(500, { message: 'Platform not available' });
	}
	if (!platform.env) {
		console.error('[list/id] GET: platform.env is missing');
		error(500, { message: 'Environment bindings not available' });
	}
	const db = platform.env.top_ten_db as D1Database | undefined;
	if (!db) {
		console.error('[list/id] GET: top_ten_db binding is missing. Available env keys:', Object.keys(platform.env));
		error(500, { message: 'Database binding top_ten_db not found' });
	}

	const listRow = await db.prepare('SELECT * FROM lists WHERE id = ?').bind(id).first<{
		id: string;
		title: string;
		category: string;
		creator_name: string | null;
		is_public: number;
		created_at: string;
		updated_at: string;
	}>();

	if (!listRow) {
		error(404, { message: 'List not found' });
	}

	const itemsRows = await db
		.prepare('SELECT * FROM list_items WHERE list_id = ? ORDER BY rank ASC')
		.bind(id)
		.all<{
			id: number;
			list_id: string;
			external_id: string;
			source: string;
			rank: number;
			title: string;
			alt_title: string | null;
			image_url: string;
			original_image_url: string;
			metadata: string | null;
		}>();

	const items = (itemsRows.results ?? []).map((row) => ({
		id: row.external_id,
		source: row.source,
		category: listRow.category,
		rank: row.rank,
		title: row.title,
		altTitle: row.alt_title ?? undefined,
		imageUrl: row.image_url,
		thumbnailUrl: row.image_url,
		originalImageUrl: row.original_image_url,
		metadata: row.metadata ? JSON.parse(row.metadata) : {}
	}));

	return json({
		id: listRow.id,
		title: listRow.title,
		category: listRow.category,
		creatorName: listRow.creator_name ?? undefined,
		isPublic: Boolean(listRow.is_public),
		createdAt: listRow.created_at,
		updatedAt: listRow.updated_at,
		items
	});
};
