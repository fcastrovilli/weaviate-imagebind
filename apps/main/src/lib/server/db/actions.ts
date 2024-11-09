import type { Action } from '@sveltejs/kit';
import { queryImages, serializeNonPOJOs, uploadImage } from './utils';
import type { BatchObjectsReturn } from 'weaviate-client';
import { createImageCollection, deleteCollection, getCollection } from './collections';
import { createCollection } from './create.js';

export const uploadImagesAction: Action = async ({ request }) => {
	const formData = await request.formData();
	const collectionName = formData.get('collectionName') as string;
	let result: BatchObjectsReturn<undefined> | null = null;
	const imageBlobs = formData.getAll('imagefiles') as File[];
	const imageFiles: { title: string; image: string }[] = [];
	if (imageBlobs.length > 0) {
		for (const imageBlob of imageBlobs) {
			imageFiles.push({
				title: imageBlob.name,
				image: await imageBlob
					.arrayBuffer()
					.then((buffer) => Buffer.from(buffer).toString('base64'))
			});
		}
		result = await uploadImage(collectionName, imageFiles);
	}
	return result ?? null;
};

export const queryImagesAction: Action = async ({ request }) => {
	const formData = await request.formData();
	const collectionName = formData.get('collectionName') as string;
	const imageBlob = formData.get('imagefile') as File;
	const image = await imageBlob
		.arrayBuffer()
		.then((buffer) => Buffer.from(buffer).toString('base64'));
	const result = await queryImages(collectionName, image, 5);
	return result;
};

export const createImageCollectionAction: Action = async ({ request }) => {
	const formData = await request.formData();
	const collectionName = formData.get('collectionName') as string;
	const result = await createImageCollection(collectionName);
	return serializeNonPOJOs(result);
};

export const deleteCollectionAction: Action = async ({ request }) => {
	const formData = await request.formData();
	const collectionName = formData.get('collectionName') as string;
	const result = await deleteCollection(collectionName);
	return { result };
};

export const deleteImageAction: Action = async ({ request }) => {
	const formData = await request.formData();
	const uuid = formData.get('uuid') as string;
	const collectionName = formData.get('collectionName') as string;

	try {
		const collection = await getCollection(collectionName);
		if (!collection) {
			return { success: false, error: 'Collection not found' };
		}

		await collection.data.deleteById(uuid);
		return { success: true };
	} catch (error) {
		console.error('Error deleting image:', error);
		return { success: false, error: 'Failed to delete image' };
	}
};

export const deleteBulkImagesAction: Action = async ({ request }) => {
	const formData = await request.formData();
	const uuids = JSON.parse(formData.get('uuids') as string) as string[];
	const collectionName = formData.get('collectionName') as string;

	try {
		const collection = await getCollection(collectionName);
		if (!collection) {
			return { success: false, error: 'Collection not found' };
		}

		await collection.data.deleteMany(collection.filter.byId().containsAny(uuids));
		return { success: true };
	} catch (error) {
		console.error('Error deleting images:', error);
		return { success: false, error: 'Failed to delete images' };
	}
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
