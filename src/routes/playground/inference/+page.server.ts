import { getCollection } from '$lib/server/db/collections';
import { getFileFromUUID } from '$lib/server/db/files';
import type { Collection, WeaviateNonGenericObject, WeaviateObject } from 'weaviate-client';
import type { Actions } from './$types';

export const actions = {
	hybrid: async ({ request, cookies }) => {
		const collectionName = cookies.get('lastSelectedCollection');
		if (!collectionName) {
			return { status: 400, error: 'No collection selected' };
		}

		const formData = await request.formData();
		const file = formData.get('file') as File;
		const query = formData.get('query') as string;

		if (!file && !query) {
			return {
				status: 400,
				error: 'No file or query provided'
			};
		}

		const collection = await getCollection(collectionName);
		if (!collection) {
			return {
				status: 400,
				error: 'Collection not found'
			};
		}

		let hybridSearch;
		if (file) {
			const arrayBuffer = await file.arrayBuffer();
			const base64String = Buffer.from(arrayBuffer).toString('base64');
			const fileType = file.type.split('/')[0]; // 'image', 'audio', or 'video'

			hybridSearch = await collection.query.hybrid(base64String, {
				[`${fileType}Fields`]: [{ name: fileType, weight: 0.8 }],
				...(query && { textFields: [{ name: 'text', weight: 0.2 }] }),
				limit: 5
			});
		} else {
			hybridSearch = await collection.query.hybrid(query, {
				limit: 5
			});
		}

		return await processSearchResults(
			collection,
			hybridSearch.objects as WeaviateObject<undefined>[]
		);
	},

	nearText: async ({ request, cookies }) => {
		const collectionName = cookies.get('lastSelectedCollection');
		if (!collectionName) {
			return { status: 400, error: 'No collection selected' };
		}

		const formData = await request.formData();
		const query = formData.get('query') as string;

		if (!query) {
			return {
				status: 400,
				error: 'No query provided'
			};
		}

		const collection = await getCollection(collectionName);
		if (!collection) {
			return {
				status: 400,
				error: 'Collection not found'
			};
		}

		const nearTextSearch = await collection.query.nearText(query, {
			limit: 5
		});

		return await processSearchResults(
			collection,
			nearTextSearch.objects as WeaviateObject<undefined>[]
		);
	},

	nearImage: async ({ request, cookies }) => {
		const collectionName = cookies.get('lastSelectedCollection');
		if (!collectionName) {
			return { status: 400, error: 'No collection selected' };
		}

		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file || !file.type.startsWith('image/')) {
			return {
				status: 400,
				error: 'No image file provided'
			};
		}

		const collection = await getCollection(collectionName);
		if (!collection) {
			return {
				status: 400,
				error: 'Collection not found'
			};
		}

		const arrayBuffer = await file.arrayBuffer();
		const base64String = Buffer.from(arrayBuffer).toString('base64');

		const nearImageSearch = await collection.query.nearImage(base64String, {
			limit: 5
		});

		return await processSearchResults(
			collection,
			nearImageSearch.objects as WeaviateObject<undefined>[]
		);
	},

	bm25: async ({ request, cookies }) => {
		const collectionName = cookies.get('lastSelectedCollection');
		if (!collectionName) {
			return { status: 400, error: 'No collection selected' };
		}

		const formData = await request.formData();
		const query = formData.get('query') as string;

		if (!query) {
			return {
				status: 400,
				error: 'No query provided'
			};
		}

		const collection = await getCollection(collectionName);
		if (!collection) {
			return {
				status: 400,
				error: 'Collection not found'
			};
		}

		const bm25Search = await collection.query.bm25(query, {
			limit: 5
		});

		return await processSearchResults(
			collection,
			bm25Search.objects as WeaviateObject<undefined>[]
		);
	}
} satisfies Actions;

async function processSearchResults(
	collection: Collection<undefined>,
	objects: WeaviateObject<undefined>[]
): Promise<{ status: number; result?: WeaviateNonGenericObject[]; error?: string }> {
	try {
		const files: WeaviateNonGenericObject[] = [];

		for (const obj of objects) {
			const mediaType = obj.properties.imageMetadata
				? 'imageMetadata'
				: obj.properties.audioMetadata
					? 'audioMetadata'
					: obj.properties.videoMetadata
						? 'videoMetadata'
						: null;

			const strippedMediaType = mediaType?.replace('Metadata', '');
			if (!strippedMediaType) continue;
			const file = await getFileFromUUID(collection, obj.uuid, strippedMediaType);
			if (file) files.push(file);
		}

		return {
			status: 200,
			result: files
		};
	} catch (error) {
		console.error('Search processing error:', error);
		return {
			status: 500,
			error: 'Error processing search results'
		};
	}
}
