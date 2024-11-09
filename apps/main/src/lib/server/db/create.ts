import weaviate from 'weaviate-client';
import { getClient } from '.';

type MediaType = 'audio' | 'image' | 'text' | 'video';
type DataType = 'text' | 'blob';

interface CreateCollectionProps {
	name: string;
	description?: string;
	mediaTypes: MediaType[];
}

function formatCollectionName(name: string): string {
	return name
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '') // Remove all spaces
		.replace(/[^a-z0-9]/g, '') // Remove special characters
		.replace(/^\d+/, '') // Remove leading numbers
		.replace(/^[a-z]/, (c) => c.toUpperCase()); // Capitalize first letter
}

export async function createCollection({ name, description, mediaTypes }: CreateCollectionProps) {
	try {
		const client = await getClient();
		const cleanedName = formatCollectionName(name);

		if (!cleanedName) {
			throw new Error(
				'Invalid collection name. Please use alphanumeric characters without spaces.'
			);
		}

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
			}
		];

		// Add a content property for each media type
		mediaTypes.forEach((mediaType) => {
			properties.push({
				name: `${mediaType}Content`,
				dataType: 'blob',
				description: `${mediaType} content stored as blob`,
				indexFilterable: true
			});
		});

		// Configure vectorizer for all selected media types
		const vectorizerConfig = {
			name: 'multi_content_vectorizer',
			textFields: [{ name: 'title', weight: 0.3 }],
			...(mediaTypes.includes('audio') && {
				audioFields: [{ name: 'audioContent', weight: 0.7 }]
			}),
			...(mediaTypes.includes('image') && {
				imageFields: [{ name: 'imageContent', weight: 0.7 }]
			}),
			...(mediaTypes.includes('video') && {
				videoFields: [{ name: 'videoContent', weight: 0.7 }]
			}),
			...(mediaTypes.includes('text') && {
				textFields: [
					{ name: 'title', weight: 0.3 },
					{ name: 'textContent', weight: 0.7 }
				]
			})
		};

		const collection = await client.collections.create({
			name: cleanedName,
			description: description || `Collection for ${mediaTypes.join(', ')} content`,
			properties: properties,
			vectorizers: [weaviate.configure.vectorizer.multi2VecBind(vectorizerConfig)]
		});

		return collection;
	} catch (error) {
		console.error('Error creating collection:', error);
		throw new Error(
			`Failed to create collection: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}
