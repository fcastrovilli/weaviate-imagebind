import type { Action } from '@sveltejs/kit';
import { getCollection } from '../collections';
import { uploadAudio, updateAudio } from '$lib/server/db/utils/audio';

export const deleteAudioAction: Action = async ({ request }) => {
	const formData = await request.formData();
	const uuid = formData.get('uuid') as string;
	const collectionName = formData.get('collectionName') as string;

	try {
		const collection = await getCollection(collectionName);
		if (!collection) {
			return { success: false, error: 'Collection not found' };
		}

		await collection.data.deleteById(uuid);
		return { success: true };
	} catch (error) {
		console.error('Error deleting audio:', error);
		return { success: false, error: 'Failed to delete audio' };
	}
};

export const deleteBulkAudioAction: Action = async ({ request }) => {
	const formData = await request.formData();
	const uuids = JSON.parse(formData.get('uuids') as string) as string[];
	const collectionName = formData.get('collectionName') as string;

	try {
		const collection = await getCollection(collectionName);
		if (!collection) {
			return { success: false, error: 'Collection not found' };
		}

		await collection.data.deleteMany(collection.filter.byId().containsAny(uuids));
		return { success: true };
	} catch (error) {
		console.error('Error deleting audio:', error);
		return { success: false, error: 'Failed to delete audio' };
	}
};

export const uploadAudiosAction: Action = async ({ request }) => {
	const formData = await request.formData();
	const collectionName = formData.get('collectionName') as string;
	const audioBlobs = formData.getAll('audiofiles') as File[];
	const titles = formData.getAll('titles') as string[];

	const audioFiles = await Promise.all(
		audioBlobs.map(async (audioBlob, index) => {
			const audioMetadata = {
				duration: 0,
				format: audioBlob.type.split('/')[1] || 'unknown',
				size: audioBlob.size
			};

			return {
				title: titles[index] || audioBlob.name,
				audio: await audioBlob
					.arrayBuffer()
					.then((buffer) => Buffer.from(buffer).toString('base64')),
				audioMetadata
			};
		})
	);

	return await uploadAudio(collectionName, audioFiles);
};

export const updateAudioAction: Action = async ({ request }) => {
	const formData = await request.formData();
	const collectionName = formData.get('collectionName') as string;
	const uuid = formData.get('uuid') as string;
	const title = formData.get('title') as string;

	try {
		const updateData: Parameters<typeof updateAudio>[2] = { title };

		const result = await updateAudio(collectionName, uuid, updateData);
		if (result) {
			return { success: true };
		}
		return { success: false, error: 'Failed to update audio' };
	} catch (error) {
		console.error('Error updating audio:', error);
		return { success: false, error: 'Failed to update audio' };
	}
};
