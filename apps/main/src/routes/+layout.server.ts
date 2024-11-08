import { getCollections } from '$lib/server/db/collections';

export const load = async () => {
	const collections = await getCollections();
	return { collections };
};
