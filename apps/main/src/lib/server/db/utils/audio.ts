import { Filters } from 'weaviate-client';
import { getCollection } from '../collections';

export const getAudios = async (collection_name: string) => {
	const collection = await getCollection(collection_name);
	if (!collection) {
		return null;
	}

	const filters = Filters.and(
		collection.filter.byProperty('imageMetadata').isNull(true),
		collection.filter.byProperty('videoMetadata').isNull(true),
		collection.filter.byProperty('textMetadata').isNull(true)
	);

	const result = await collection.query.fetchObjects({
		returnProperties: ['title', 'audio'],
		filters: filters,
		limit: 100
	});

	return result.objects;
};

export const uploadAudio = async (
	collection_name: string,
	audios: {
		title: string;
		audio: string;
		audioMetadata: {
			duration: number;
			format: string;
			size: number;
		};
	}[]
) => {
	const collection = await getCollection(collection_name);
	if (!collection) {
		return null;
	}

	const batch = await collection.data.insertMany(audios);
	return batch;
};

export const updateAudio = async (
	collection_name: string,
	uuid: string,
	data: {
		title?: string;
		audio?: string;
		audioMetadata?: {
			duration: number;
			format: string;
			size: number;
		};
	}
) => {
	const collection = await getCollection(collection_name);
	if (!collection) {
		return null;
	}

	// Use the new v3 update syntax
	const response = await collection.data.update({
		id: uuid,
		properties: data
	});

	return response;
};
