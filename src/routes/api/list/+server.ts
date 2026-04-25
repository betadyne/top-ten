import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import { generateId } from '$lib/utils/id';

const createListSchema = z.object({
	title: z.string().min(1).max(100),
	category: z.enum(['anime', 'character', 'light-novel', 'visual-novel']),
	items: z
		.array(
			z.object({
				id: z.string(),
				source: z.string(),
				rank: z.number().int().min(1).max(10),
				title: z.string(),
				altTitle: z.string().optional(),
				imageUrl: z.string(),
				originalImageUrl: z.string(),
				metadata: z.string().optional()
			})
		)
		.min(1)
		.max(10),
	creatorName: z.string().max(50).optional(),
	isPublic: z.boolean()
});

export const POST: RequestHandler = async ({ request, platform }) => {
	const body = await request.json();
	const parseResult = createListSchema.safeParse(body);
	if (!parseResult.success) {
		const issues = parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
		error(400, { message: `Invalid request body: ${issues}` });
	}

	const data = parseResult.data;
	const id = generateId();
	const now = new Date().toISOString();

	const db = platform?.env?.top_ten_db as D1Database | undefined;
	if (!db) {
		error(500, { message: 'Database not available' });
	}

	await db
		.prepare(
			'INSERT INTO lists (id, title, category, creator_name, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
		)
		.bind(id, data.title, data.category, data.creatorName ?? null, data.isPublic ? 1 : 0, now, now)
		.run();

	const stmt = db.prepare(
		'INSERT INTO list_items (list_id, external_id, source, rank, title, alt_title, image_url, original_image_url, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
	);
	for (const item of data.items) {
		await stmt.bind(id, item.id, item.source, item.rank, item.title, item.altTitle ?? null, item.imageUrl, item.originalImageUrl, item.metadata ?? null).run();
	}

	return json({ id }, { status: 201 });
};
