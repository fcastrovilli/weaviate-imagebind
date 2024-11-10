import { Filters } from 'weaviate-client';
import { getCollection } from '../collections';

export const getImages = async (collection_name: string) => {
	const collection = await getCollection(collection_name);
	if (!collection) {
		return null;
	}

	const properties = (await collection.config.get()).properties.map((p) => p.name);

	const filters = Filters.and(
		...(properties.includes('audioMetadata')
			? [collection.filter.byProperty('audioMetadata').isNull(true)]
			: []),
		...(properties.includes('videoMetadata')
			? [collection.filter.byProperty('videoMetadata').isNull(true)]
			: []),
		...(properties.includes('textMetadata')
			? [collection.filter.byProperty('textMetadata').isNull(true)]
			: [])
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

export const IMAGE_MIME_TYPES: Record<string, string> = {
	jpeg: 'image/jpeg',
	jpg: 'image/jpeg',
	png: 'image/png',
	gif: 'image/gif',
	webp: 'image/webp'
};

export const getImageExtension = (mimeType: string): string => {
	const entry = Object.entries(IMAGE_MIME_TYPES).find(([mime]) => mime === mimeType);
	return entry ? entry[0] : 'jpg'; // default to jpg if unknown
};

export const getImageFileData = (imageString: string, mimeType: string) => {
	try {
		const fileContent = atob(imageString);
		const arrayBuffer = new ArrayBuffer(fileContent.length);
		const uint8Array = new Uint8Array(arrayBuffer);

		for (let i = 0; i < fileContent.length; i++) {
			uint8Array[i] = fileContent.charCodeAt(i);
		}

		return {
			buffer: uint8Array,
			extension: getImageExtension(mimeType),
			mimeType: mimeType || IMAGE_MIME_TYPES.jpeg
		};
	} catch (error) {
		console.error('Error processing image data:', error);
		return null;
	}
};
