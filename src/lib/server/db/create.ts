import weaviate from 'weaviate-client';
import { getClient } from '.';

type MediaType = 'audio' | 'image' | 'text' | 'video';
type DataType = 'text' | 'blob' | 'number' | 'int' | 'boolean' | 'date' | 'object';

type NestedProperty = {
	name: string;
	dataType: Exclude<DataType, 'object'>;
	description?: string;
};

interface Property {
	name: string;
	dataType: DataType;
	description: string;
	indexFilterable: boolean;
	indexSearchable: boolean;
	nestedProperties?: NestedProperty[];
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
			properties.push(
				{
					name: 'audio',
					dataType: 'blob',
					description: 'Audio content in base64',
					indexFilterable: false,
					indexSearchable: false
				},
				{
					name: 'audioMetadata',
					dataType: 'object',
					description: 'Metadata for audio content',
					indexFilterable: true,
					indexSearchable: false,
					nestedProperties: [
						{ name: 'duration', dataType: 'number' },
						{ name: 'format', dataType: 'text' },
						{ name: 'size', dataType: 'number' }
					]
				}
			);
		}

		if (mediaTypes.includes('image')) {
			properties.push(
				{
					name: 'image',
					dataType: 'blob',
					description: 'Image content in base64',
					indexFilterable: false,
					indexSearchable: false
				},
				{
					name: 'imageMetadata',
					dataType: 'object',
					description: 'Metadata for image content',
					indexFilterable: true,
					indexSearchable: false,
					nestedProperties: [
						{ name: 'width', dataType: 'int' },
						{ name: 'height', dataType: 'int' },
						{ name: 'format', dataType: 'text' },
						{ name: 'size', dataType: 'number' }
					]
				}
			);
		}

		if (mediaTypes.includes('video')) {
			properties.push(
				{
					name: 'video',
					dataType: 'blob',
					description: 'Video content in base64',
					indexFilterable: false,
					indexSearchable: false
				},
				{
					name: 'videoMetadata',
					dataType: 'object',
					description: 'Metadata for video content',
					indexFilterable: true,
					indexSearchable: false,
					nestedProperties: [
						{ name: 'duration', dataType: 'number' },
						{ name: 'width', dataType: 'int' },
						{ name: 'height', dataType: 'int' },
						{ name: 'format', dataType: 'text' },
						{ name: 'size', dataType: 'number' },
						{ name: 'fps', dataType: 'number' }
					]
				}
			);
		}

		if (mediaTypes.includes('text')) {
			properties.push(
				{
					name: 'text',
					dataType: 'text',
					description: 'Text content',
					indexFilterable: true,
					indexSearchable: true
				},
				{
					name: 'textMetadata',
					dataType: 'object',
					description: 'Metadata for text content',
					indexFilterable: true,
					indexSearchable: false,
					nestedProperties: [
						{ name: 'wordCount', dataType: 'int' },
						{ name: 'language', dataType: 'text' },
						{ name: 'format', dataType: 'text' },
						{ name: 'encoding', dataType: 'text' }
					]
				}
			);
		}

		// Configure vectorizer
		const vectorizerConfig = {
			name: 'title_vector',
			textFields: [{ name: 'title', weight: 0.2 }],
			...(mediaTypes.includes('audio') && {
				audioFields: [{ name: 'audio', weight: 0.8 }]
			}),
			...(mediaTypes.includes('image') && {
				imageFields: [{ name: 'image', weight: 0.8 }]
			}),
			...(mediaTypes.includes('video') && {
				videoFields: [{ name: 'video', weight: 0.8 }]
			}),
			...(mediaTypes.includes('text') && {
				textFields: [
					{ name: 'title', weight: 0.2 },
					{ name: 'text', weight: 0.8 }
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
