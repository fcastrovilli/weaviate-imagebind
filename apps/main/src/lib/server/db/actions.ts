import type { Action } from '@sveltejs/kit';
import { queryImages, uploadImage } from './utils';
import type { BatchObjectsReturn } from 'weaviate-client';
import { createImageCollection } from './collections';

export const uploadImagesAction: Action = async ({ request }) => {
	const formData = await request.formData();
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
		result = await uploadImage('Imagetest', imageFiles);
	}
	return result ?? null;
};

export const queryImagesAction: Action = async ({ request }) => {
	const formData = await request.formData();
	const imageBlob = formData.get('imagefile') as File;
	const image = await imageBlob
		.arrayBuffer()
		.then((buffer) => Buffer.from(buffer).toString('base64'));
	const result = await queryImages('Images', image, 5);
	return result;
};

export const createImageCollectionAction: Action = async ({ request }) => {
	const formData = await request.formData();
	const collectionName = formData.get('collectionName') as string;
	const result = await createImageCollection(collectionName);
	return { result: result.name ?? null };
};
