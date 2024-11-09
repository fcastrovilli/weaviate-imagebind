import { getImages } from '$lib/server/db/utils';
import type { WeaviateNonGenericObject } from 'weaviate-client';
import {
	deleteImageAction,
	deleteBulkImagesAction,
	uploadImagesAction
} from '$lib/server/db/actions';

export const load = async ({ cookies, depends }) => {
	depends('app:collection');
	const collectionName = cookies.get('lastSelectedCollection');
	if (!collectionName) return { images: null };

	console.log(collectionName);

	const images: WeaviateNonGenericObject[] | null = await getImages(collectionName);

	return { images };
};

export const actions = {
	uploadImagesAction,
	deleteImage: deleteImageAction,
	deleteBulkImages: deleteBulkImagesAction
};
