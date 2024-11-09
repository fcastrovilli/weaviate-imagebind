import { getCollections } from '$lib/server/db/collections';

export const load = async () => {
	try {
		const collections = await getCollections();
		return {
			collections: collections ?? []
		};
	} catch (error) {
		console.error('Error loading collections:', error);
		return {
			collections: []
		};
	}
};
