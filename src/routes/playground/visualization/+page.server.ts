import { getAllFilesFromCollection } from '$lib/server/db/collections';

export const load = async ({ cookies, depends }) => {
	depends('app:collection');
	const collectionName = cookies.get('lastSelectedCollection');
	if (!collectionName) return null;
	const files = await getAllFilesFromCollection(collectionName);
	return { files };
};
