import { getCollection } from '../collections';

export const getImages = async (collection_name: string) => {
	const collection = await getCollection(collection_name);
	if (!collection) {
		return null;
	}

	const result = await collection.query.fetchObjects({
		returnProperties: ['title', 'image'],
		filters: collection.filter.byProperty('image').isNull(false),
		limit: 100
	});

	return result.objects;
};

export const uploadImages = async (
	collection_name: string,
	images: { title: string; image: string }[]
) => {
	const collection = await getCollection(collection_name);
	if (!collection) {
		return null;
	}

	// The vectorizer will automatically handle the image content
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
