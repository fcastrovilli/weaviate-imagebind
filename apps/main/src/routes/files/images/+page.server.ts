import { getImages } from '$lib/server/db/utils';
import type { WeaviateNonGenericObject } from 'weaviate-client';
import { deleteImageAction, deleteBulkImagesAction } from '$lib/server/db/actions';

export const load = async () => {
	const images: WeaviateNonGenericObject[] | null = await getImages('Images');
	return { images };
};

export const actions = {
	deleteImage: deleteImageAction,
	deleteBulkImages: deleteBulkImagesAction
};
