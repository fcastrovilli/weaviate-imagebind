import { getCollection } from '../collections';

export const getAudios = async (collection_name: string) => {
	const collection = await getCollection(collection_name);
	if (!collection) {
		return null;
	}

	const result = await collection.query.fetchObjects({
		returnProperties: ['title', 'audio'],
		filters: collection.filter.byProperty('audio').isNull(false),
		limit: 100
	});

	return result.objects;
};

export const uploadAudio = async (
	collection_name: string,
	audios: { title: string; audio: string }[]
) => {
	const collection = await getCollection(collection_name);
	if (!collection) {
		return null;
	}

	const batch = await collection.data.insertMany(audios);
	return batch;
};
