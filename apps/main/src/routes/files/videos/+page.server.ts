import { getVideos } from '$lib/server/db/utils';
import type { WeaviateNonGenericObject } from 'weaviate-client';
import {
	deleteVideoAction,
	deleteBulkVideosAction,
	uploadVideosAction
} from '$lib/server/db/actions/video';

export const load = async ({ cookies, depends }) => {
	depends('app:collection');
	const collectionName = cookies.get('lastSelectedCollection');
	if (!collectionName) return { videos: null };

	const videos: WeaviateNonGenericObject[] | null = await getVideos(collectionName);
	return { videos };
};

export const actions = {
	uploadVideosAction,
	deleteVideoAction,
	deleteBulkVideosAction
};
