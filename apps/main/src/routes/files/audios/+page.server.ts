import { getImages } from '$lib/server/db/utils';
import type { WeaviateNonGenericObject } from 'weaviate-client';

export const load = async ({ cookies, depends }) => {
	depends('app:collection');
	const collectionName = cookies.get('lastSelectedCollection');
	if (!collectionName) return { images: null };

	const images: WeaviateNonGenericObject[] | null = await getImages(collectionName);
	return { images };
};
