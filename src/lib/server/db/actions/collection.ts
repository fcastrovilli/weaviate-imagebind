import type { Action } from '@sveltejs/kit';
import { serializeNonPOJOs } from '../utils';
import { deleteCollection } from '../collections';
import { createCollection } from '../create.js';

export const deleteCollectionAction: Action = async ({ request }) => {
	const formData = await request.formData();
	const collectionName = formData.get('collectionName') as string;
	const result = await deleteCollection(collectionName);
	return { result };
};

export const createCollectionAction: Action = async ({ request }) => {
	const formData = await request.formData();
	const name = formData.get('name') as string;
	const description = formData.get('description') as string | undefined;
	const mediaTypes = formData.getAll('mediaTypes') as string[];

	if (!name || mediaTypes.length === 0) {
		return {
			success: false,
			error: 'Name and at least one media type are required'
		};
	}

	try {
		const result = await createCollection({
			name,
			description,
			mediaTypes: mediaTypes as ('audio' | 'image' | 'text' | 'video')[]
		});

		return {
			success: true,
			collection: serializeNonPOJOs(result)
		};
	} catch (error) {
		console.error('Error creating collection:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create collections'
		};
	}
};
