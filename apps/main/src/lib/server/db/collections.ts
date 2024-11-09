import weaviate from 'weaviate-client';
import { getClient } from '.';
import type { CollectionInterface } from '$lib/types';

export const getCollections = async () => {
	const client = await getClient();
	const collections = await client.collections.listAll();
	const cleanedCollections: CollectionInterface[] = [];
	for (const collection of collections) {
		cleanedCollections.push({
			name: collection.name,
			description: collection.description,
			config: {
				vectorizers: collection.vectorizers,
				properties: collection.properties,
				references: collection.references
			}
		});
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
	return client.collections.get(name);
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
	const cleanedCollection: CollectionInterface = {
		name: collection.name,
		description: config.description,
		config: {
			vectorizers: config.vectorizers,
			properties: config.properties,
			references: config.references
		}
	};
	return cleanedCollection;
};

export const deleteCollection = async (collection: string) => {
	const client = await getClient();
	return client.collections.delete(collection);
};

export const createFullCollection = async (name: string) => {
	const client = await getClient();
	const collection = await client.collections.create({
		name: name,
		properties: [
			{
				name: 'text',
				dataType: 'text'
			},
			{
				name: 'audio',
				dataType: 'blob'
			},
			{
				name: 'image',
				dataType: 'blob'
			}
		],
		vectorizers: [
			weaviate.configure.vectorizer.multi2VecBind({
				textFields: [
					{
						name: 'text',
						weight: 0.5
					}
				],
				audioFields: [
					{
						name: 'audio',
						weight: 0.4
					}
				],
				imageFields: [
					{
						name: 'image',
						weight: 0.7
					}
				]
			})
		]
	});
	return collection;
};

export const createImageCollection = async (name: string) => {
	const client = await getClient();
	return client.collections.create({
		name: name,
		properties: [{ name: 'image', dataType: 'blob' }],
		vectorizers: [
			weaviate.configure.vectorizer.multi2VecBind({
				name: 'title_vector',
				imageFields: ['image']
			})
		]
	});
};
