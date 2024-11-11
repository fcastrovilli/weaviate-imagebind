import { getTexts } from '$lib/server/db/utils';
import type { WeaviateNonGenericObject } from 'weaviate-client';
import {
	deleteTextAction,
	deleteBulkTextsAction,
	uploadTextsAction
} from '$lib/server/db/actions/text';

export const load = async ({ cookies, depends }) => {
	depends('app:collection');
	const collectionName = cookies.get('lastSelectedCollection');
	if (!collectionName) return { texts: null };

	const texts: WeaviateNonGenericObject[] | null = await getTexts(collectionName);
	return { texts };
};

export const actions = {
	uploadTextsAction,
	deleteTextAction,
	deleteBulkTextsAction
};
