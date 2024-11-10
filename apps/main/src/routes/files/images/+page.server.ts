import { getImages } from '$lib/server/db/utils/image';
import type { WeaviateNonGenericObject } from 'weaviate-client';
import {
	deleteImageAction,
	deleteBulkImagesAction,
	uploadImagesAction,
	updateImageAction
} from '$lib/server/db/actions/image';

export const load = async ({ cookies, depends }) => {
	depends('app:collection');
	const collectionName = cookies.get('lastSelectedCollection');
	if (!collectionName) return { images: null };

	const images: WeaviateNonGenericObject[] | null = await getImages(collectionName);

	return { images };
};

export const actions = {
	uploadImagesAction,
	updateImageAction,
	deleteImage: deleteImageAction,
	deleteBulkImages: deleteBulkImagesAction
};
