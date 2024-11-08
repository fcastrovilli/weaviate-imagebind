import { getCollection } from './collections';

export const uploadImage = async (
	collection_name: string,
	images: { title: string; image: string }[]
) => {
	const collection = await getCollection(collection_name);
	if (!collection) {
		return null;
	}
	const batch = await collection.data.insertMany(images);
	return batch;
};

export const getImages = async (collection_name: string) => {
	const collection = await getCollection(collection_name);
	if (!collection) {
		return null;
	}
	const images = await collection.query.fetchObjects();
	return images.objects;
};

export const serializeNonPOJOs = (value: object | null) => {
	return JSON.parse(JSON.stringify(value));
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
