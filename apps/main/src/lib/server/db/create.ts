import weaviate from 'weaviate-client';
import { getClient } from '.';

type MediaType = 'audio' | 'image' | 'text' | 'video';
type DataType = 'text' | 'blob';

interface Property {
	name: string;
	dataType: DataType;
	description: string;
	indexFilterable: boolean;
	indexSearchable: boolean;
}

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

		// Base properties
		const properties: Property[] = [
			{
				name: 'title',
				dataType: 'text',
				description: 'Title of the content',
				indexFilterable: true,
				indexSearchable: true
			}
		];

		// Add media-specific properties
		if (mediaTypes.includes('audio')) {
			properties.push({
				name: 'audio',
				dataType: 'blob',
				description: 'Audio content in base64',
				indexFilterable: true,
				indexSearchable: false
			});
		}

		if (mediaTypes.includes('image')) {
			properties.push({
				name: 'image',
				dataType: 'blob',
				description: 'Image content in base64',
				indexFilterable: true,
				indexSearchable: false
			});
		}

		if (mediaTypes.includes('video')) {
			properties.push({
				name: 'video',
				dataType: 'blob',
				description: 'Video content in base64',
				indexFilterable: true,
				indexSearchable: false
			});
		}

		if (mediaTypes.includes('text')) {
			properties.push({
				name: 'text',
				dataType: 'text',
				description: 'Text content',
				indexFilterable: true,
				indexSearchable: true
			});
		}

		// Configure vectorizer
		const vectorizerConfig = {
			name: 'title_vector',
			textFields: [{ name: 'title', weight: 0.1 }],
			...(mediaTypes.includes('audio') && {
				audioFields: [{ name: 'audio', weight: 0.9 }]
			}),
			...(mediaTypes.includes('image') && {
				imageFields: [{ name: 'image', weight: 0.9 }]
			}),
			...(mediaTypes.includes('video') && {
				videoFields: [{ name: 'video', weight: 0.9 }]
			}),
			...(mediaTypes.includes('text') && {
				textFields: [
					{ name: 'title', weight: 0.1 },
					{ name: 'text', weight: 0.9 }
				]
			})
		};

		const collection = await client.collections.create({
			name: cleanedName,
			description: description || `Collection for ${mediaTypes.join(', ')} content`,
			properties: properties,
			invertedIndex: { indexNullState: true },
			vectorizers: [weaviate.configure.vectorizer.multi2VecBind(vectorizerConfig)]
		});

		return collection;
	} catch (error) {
		console.error('Error creating collection:', error);
		throw error;
	}
}
