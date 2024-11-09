import { getCollection } from '$lib/server/db/collections';

export const load = async ({ params }) => {
	const collection = await getCollection(params.name);
	return {
		collection
	};
};
