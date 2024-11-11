import { getCollection } from '$lib/server/db/collections';

export const load = async ({ cookies, depends }) => {
	depends('app:collection');
	const collectionName = cookies.get('lastSelectedCollection');
	const collection = await getCollection(collectionName!);
	if (!collection) return { result: null };

	const object = await collection.query.fetchObjects({
		limit: 1
	});

	const result = await collection?.query.nearObject(object.objects[0].uuid, {
		returnMetadata: ['distance'],
		limit: 100
	});

	return { result };
};
