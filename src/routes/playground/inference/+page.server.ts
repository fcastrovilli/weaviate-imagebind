import { getCollection } from '$lib/server/db/collections';
import { getAudios } from '$lib/server/db/utils/audio';
import { getImages } from '$lib/server/db/utils/image';

export const load = async ({ cookies, depends }) => {
	depends('app:collection');
	const collectionName = cookies.get('lastSelectedCollection');
	if (!collectionName) return { audios: null, images: null };
	const allFiles = await getAllFiles(collectionName);

	return allFiles;
};

const getAllFiles = async (collection_name: string) => {
	const collection = await getCollection(collection_name);
	if (!collection) {
		return null;
	}

	const images = await getImages(collection_name, false);
	const audios = await getAudios(collection_name, false);

	return { images, audios };
};
