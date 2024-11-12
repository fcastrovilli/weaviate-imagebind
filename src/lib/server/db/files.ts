import type { Collection } from 'weaviate-client';

export const getFileFromUUID = async (
	collection: Collection<undefined>,
	uuid: string,
	mediaType: string
) => {
	const file = await collection.query.fetchObjectById(uuid, {
		returnProperties: ['title', `${mediaType}`]
	});
	return file;
};
