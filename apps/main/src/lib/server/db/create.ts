import weaviate from 'weaviate-client';
import { getClient } from '.';

type MediaType = 'audio' | 'image' | 'text' | 'video';
type DataType = 'text' | 'blob';

interface CreateCollectionProps {
	name: string;
	description?: string;
	mediaType: MediaType;
}

export async function createCollection({ name, description, mediaType }: CreateCollectionProps) {
	try {
		const client = await getClient();
		const cleanedName = name.charAt(0).toUpperCase() + name.slice(1);

		// Define base properties that all collections will have
		const properties: {
			name: string;
			dataType: DataType;
			description?: string;
			indexFilterable?: boolean;
			indexSearchable?: boolean;
		}[] = [
			{
				name: 'title',
				dataType: 'text',
				description: 'Title of the content',
				indexFilterable: true,
				indexSearchable: true
			},
			{
				name: 'content',
				dataType: 'blob',
				description: `${mediaType} content stored as blob`,
				indexFilterable: true
			}
		];

		// Configure vectorizer based on media type
		const vectorizerFields = {
			textFields: [{ name: 'title', weight: 0.3 }],
			...(mediaType === 'audio' && { audioFields: [{ name: 'content', weight: 0.7 }] }),
			...(mediaType === 'image' && { imageFields: [{ name: 'content', weight: 0.7 }] }),
			...(mediaType === 'video' && { videoFields: [{ name: 'content', weight: 0.7 }] }),
			...(mediaType === 'text' && { textFields: [{ name: 'title', weight: 1.0 }] })
		};

		console.log(vectorizerFields);

		const collection = await client.collections.create({
			name: cleanedName,
			description: description || `Collection for ${mediaType} content`,
			properties: properties,
			vectorizers: [weaviate.configure.vectorizer.multi2VecBind(vectorizerFields)]
		});

		console.log(collection);
		return collection;
	} catch (error) {
		console.error('Error creating collection:', error);
		throw new Error(
			`Failed to create collection: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}
