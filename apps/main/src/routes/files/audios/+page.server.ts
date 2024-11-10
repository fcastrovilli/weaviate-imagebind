import { getAudios } from '$lib/server/db/utils/audio';
import type { WeaviateNonGenericObject } from 'weaviate-client';
import {
	deleteAudioAction,
	deleteBulkAudioAction,
	updateAudioAction,
	uploadAudiosAction
} from '$lib/server/db/actions/audio';

export const load = async ({ cookies, depends }) => {
	depends('app:collection');
	const collectionName = cookies.get('lastSelectedCollection');
	if (!collectionName) return { audios: null };

	const audios: WeaviateNonGenericObject[] | null = await getAudios(collectionName);
	return { audios };
};

export const actions = {
	updateAudioAction,
	uploadAudiosAction,
	deleteAudio: deleteAudioAction,
	deleteBulkAudios: deleteBulkAudioAction
};
