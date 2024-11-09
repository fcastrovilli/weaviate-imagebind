import { getCollectionClient } from '$lib/server/db/collections';
import { redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const collection = await getCollectionClient(params.name);
	if (!collection) {
		redirect(304, '/collections');
	}
	return {
		collection
	};
};
