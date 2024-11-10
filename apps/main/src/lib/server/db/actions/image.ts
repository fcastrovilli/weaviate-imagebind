import type { Action } from '@sveltejs/kit';
import { getCollection } from '../collections';
import { uploadImages } from '$lib/server/db/utils/image';
import sharp from 'sharp';
import { updateImage } from '$lib/server/db/utils/image';

export const uploadImagesAction: Action = async ({ request }) => {
	const formData = await request.formData();
	const collectionName = formData.get('collectionName') as string;
	const imageBlobs = formData.getAll('imagefiles') as File[];
	const titles = formData.getAll('titles') as string[];

	const imageFiles = await Promise.all(
		imageBlobs.map(async (imageBlob, index) => {
			// Convert File to Buffer
			const arrayBuffer = await imageBlob.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			// Get image metadata using sharp
			const metadata = await sharp(buffer).metadata();

			const imageMetadata = {
				width: metadata.width || 0,
				height: metadata.height || 0,
				format: metadata.format || 'unknown',
				size: imageBlob.size
			};

			return {
				title: titles[index] || imageBlob.name,
				image: buffer.toString('base64'),
				imageMetadata
			};
		})
	);

	return await uploadImages(collectionName, imageFiles);
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

export const updateImageAction: Action = async ({ request }) => {
	const formData = await request.formData();
	const collectionName = formData.get('collectionName') as string;
	const uuid = formData.get('uuid') as string;
	const title = formData.get('title') as string;

	try {
		const updateData: Parameters<typeof updateImage>[2] = { title };

		const result = await updateImage(collectionName, uuid, updateData);
		if (result) {
			return { success: true };
		}
		return { success: false, error: 'Failed to update image' };
	} catch (error) {
		console.error('Error updating image:', error);
		return { success: false, error: 'Failed to update image' };
	}
};
