import { Filters } from 'weaviate-client';
import { getCollection } from '../collections';

export const getImages = async (collection_name: string) => {
	const collection = await getCollection(collection_name);
	if (!collection) {
		return null;
	}

	const filters = Filters.and(
		collection.filter.byProperty('audioMetadata').isNull(true),
		collection.filter.byProperty('videoMetadata').isNull(true),
		collection.filter.byProperty('textMetadata').isNull(true)
	);

	const result = await collection.query.fetchObjects({
		returnProperties: ['title', 'image'],
		filters: filters,
		limit: 100
	});

	return result.objects;
};

export const uploadImages = async (
	collection_name: string,
	images: {
		title: string;
		image: string;
		imageMetadata: {
			width: number;
			height: number;
			format: string;
			size: number;
		};
	}[]
) => {
	const collection = await getCollection(collection_name);
	if (!collection) {
		return null;
	}

	const batch = await collection.data.insertMany(images);
	return batch;
};

export const queryImages = async (
	collection_name: string,
	image: string | Buffer,
	limit: number = 5
) => {
	const collection = await getCollection(collection_name);
	if (!collection) {
		return null;
	}
	const result = await collection.query.nearImage(image, {
		limit: limit
	});
	return result;
};

export const updateImage = async (
	collection_name: string,
	uuid: string,
	data: {
		title?: string;
		image?: string;
		imageMetadata?: {
			width: number;
			height: number;
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
