import { Filters } from 'weaviate-client';
import { getCollection } from '../collections';
import * as mm from 'music-metadata';

export const AUDIO_MIME_TYPES: Record<string, string> = {
	mp3: 'audio/mpeg',
	wav: 'audio/wav',
	ogg: 'audio/ogg',
	m4a: 'audio/mp4'
};

export const getAudioExtension = (mimeType: string): string => {
	const entry = Object.entries(AUDIO_MIME_TYPES).find(([mime]) => mime === mimeType);
	return entry ? entry[0] : 'mp3'; // default to mp3 if unknown
};

export const getAudios = async (collection_name: string) => {
	const collection = await getCollection(collection_name);
	if (!collection) {
		return null;
	}
	const properties = (await collection.config.get()).properties.map((p) => p.name);

	const filters = Filters.and(
		...(properties.includes('imageMetadata')
			? [collection.filter.byProperty('imageMetadata').isNull(true)]
			: []),
		...(properties.includes('videoMetadata')
			? [collection.filter.byProperty('videoMetadata').isNull(true)]
			: []),
		...(properties.includes('textMetadata')
			? [collection.filter.byProperty('textMetadata').isNull(true)]
			: [])
	);

	const result = await collection.query.fetchObjects({
		returnProperties: ['title', 'audio'],
		filters: filters,
		limit: 100
	});

	return result.objects;
};

export const uploadAudio = async (
	collection_name: string,
	audios: {
		title: string;
		audio: string;
		audioMetadata: {
			duration: number;
			format: string;
			size: number;
		};
	}[]
) => {
	const collection = await getCollection(collection_name);
	if (!collection) {
		return null;
	}

	// Process each audio file to get correct duration
	const processedAudios = await Promise.all(
		audios.map(async (audio) => {
			const audioData = await getAudioFileData(audio.audio, audio.audioMetadata.format);
			return {
				...audio,
				audioMetadata: {
					...audio.audioMetadata,
					duration: audioData?.duration || 0
				}
			};
		})
	);

	const batch = await collection.data.insertMany(processedAudios);
	return batch;
};

export const updateAudio = async (
	collection_name: string,
	uuid: string,
	data: {
		title?: string;
		audio?: string;
		audioMetadata?: {
			duration: number;
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

export const getAudioFileData = async (audioString: string, mimeType: string) => {
	try {
		const fileContent = atob(audioString);
		const arrayBuffer = new ArrayBuffer(fileContent.length);
		const uint8Array = new Uint8Array(arrayBuffer);

		for (let i = 0; i < fileContent.length; i++) {
			uint8Array[i] = fileContent.charCodeAt(i);
		}

		// Parse metadata using music-metadata
		const metadata = await mm.parseBuffer(uint8Array, {
			mimeType: mimeType || AUDIO_MIME_TYPES.mp3
		});

		return {
			buffer: uint8Array,
			extension: getAudioExtension(mimeType),
			mimeType: mimeType || AUDIO_MIME_TYPES.mp3,
			duration: metadata.format.duration || 0
		};
	} catch (error) {
		console.error('Error processing audio data:', error);
		return null;
	}
};
