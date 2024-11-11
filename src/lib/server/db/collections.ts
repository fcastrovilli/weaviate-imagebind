import { getClient } from '.';
import type { CollectionInterface } from '$lib/types';

export const getCollections = async () => {
	const client = await getClient();
	const collections = await client.collections.listAll();
	const cleanedCollections: CollectionInterface[] = [];

	for (const collection of collections) {
		try {
			const config = await client.collections.get(collection.name).config.get();

			// Parse media types from properties
			const mediaTypes = new Set<'audio' | 'image' | 'text' | 'video'>();
			config.properties.forEach((prop) => {
				if (prop.dataType === 'blob') {
					const type = prop.name.toLowerCase();
					if (type.includes('audio')) mediaTypes.add('audio');
					if (type.includes('image')) mediaTypes.add('image');
					if (type.includes('video')) mediaTypes.add('video');
				} else if (prop.dataType === 'text' && !prop.name.toLowerCase().includes('title')) {
					mediaTypes.add('text');
				}
			});

			cleanedCollections.push({
				name: collection.name,
				description: config.description || '',
				config: {
					vectorizers: Array.isArray(config.vectorizers) ? config.vectorizers : [],
					properties: config.properties,
					references: config.references || [],
					mediaTypes: [...mediaTypes]
				}
			});
		} catch (error) {
			console.error(`Error processing collection ${collection.name}:`, error);
			cleanedCollections.push({
				name: collection.name,
				description: 'Configuration unavailable',
				config: {
					vectorizers: [],
					properties: [],
					references: [],
					mediaTypes: []
				}
			});
		}
	}
	return cleanedCollections;
};

export const getCollection = async (name: string) => {
	const client = await getClient();
	const cleanedName = name.charAt(0).toUpperCase() + name.slice(1);
	const exists = await client.collections.exists(cleanedName);
	if (!exists) {
		return null;
	}
	return client.collections.get(cleanedName);
};

export const getCollectionClient = async (name: string): Promise<CollectionInterface | null> => {
	const client = await getClient();
	const cleanedName = name.charAt(0).toUpperCase() + name.slice(1);
	const exists = await client.collections.exists(cleanedName);
	if (!exists) {
		return null;
	}
	const collection = client.collections.get(cleanedName);
	const config = await collection.config.get();

	// Parse media types from properties
	const mediaTypes = new Set<'audio' | 'image' | 'text' | 'video'>();
	config.properties.forEach((prop) => {
		if (prop.dataType === 'blob') {
			const type = prop.name.toLowerCase();
			if (type.includes('audio')) mediaTypes.add('audio');
			if (type.includes('image')) mediaTypes.add('image');
			if (type.includes('video')) mediaTypes.add('video');
		} else if (prop.dataType === 'text' && !prop.name.toLowerCase().includes('title')) {
			mediaTypes.add('text');
		}
	});

	const cleanedCollection: CollectionInterface = {
		name: collection.name,
		description: config.description || '',
		config: {
			vectorizers: Array.isArray(config.vectorizers) ? config.vectorizers : [],
			properties: config.properties,
			references: config.references || [],
			mediaTypes: [...mediaTypes]
		}
	};
	return cleanedCollection;
};

export const deleteCollection = async (collection: string) => {
	const client = await getClient();
	return client.collections.delete(collection);
};

export const getAllFilesFromCollection = async (collection_name: string) => {
	const collection = await getCollection(collection_name);
	if (!collection) return null;
	const files = await collection.query.fetchObjects();
	return files.objects;
};
