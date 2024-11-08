import weaviate from 'weaviate-client';
import { getClient } from '.';

export const getCollections = async () => {
	const client = await getClient();
	return client.collections.listAll();
};

export const getCollection = async (name: string) => {
	const client = await getClient();
	const exists = await client.collections.exists(name);
	if (!exists) {
		return null;
	}
	return client.collections.get(name);
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
