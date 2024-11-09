import { getImages } from '$lib/server/db/utils';
import type { WeaviateNonGenericObject } from 'weaviate-client';

export const load = async () => {
	const images: WeaviateNonGenericObject[] | null = await getImages('Images');
	return { images };
};
