import { getCollection } from '$lib/server/db/collections';
import type { MediaType, Relation } from '$lib/types/visualization';
import { fail } from '@sveltejs/kit';

// Server action to fetch media data on demand
export const actions = {
	getMediaData: async ({ request }) => {
		const data = await request.formData();
		const uuid = data.get('uuid')?.toString();
		const mediaType = data.get('mediaType')?.toString();
		const collectionName = data.get('collection')?.toString();

		if (!uuid || !mediaType || !collectionName) {
			return fail(400, { error: 'Missing required parameters' });
		}

		const collection = await getCollection(collectionName);
		if (!collection) {
			return fail(404, { error: 'Collection not found' });
		}

		// Map media type to actual property name
		const propertyMap: Record<MediaType, string> = {
			image: 'image',
			audio: 'audio',
			video: 'video',
			text: 'text'
		};

		const propertyName = propertyMap[mediaType as MediaType];

		const result = await collection.query.fetchObjectById(uuid, {
			returnProperties: [propertyName]
		});

		if (!result) {
			return fail(404, { error: 'Object not found' });
		}

		return { success: true, mediaData: result.properties[propertyName] };
	}
};

export const load = async ({ cookies, depends }) => {
	depends('app:collection');
	const collectionName = cookies.get('lastSelectedCollection');

	const collection = await getCollection(collectionName!);
	if (!collection) return { visualization: null };

	// Get the schema first to check available properties
	const schema = await collection.config.get();
	if (!schema) return { visualization: null };

	// Extract available media properties from schema
	const properties = schema.properties?.map((prop) => prop.name) || [];

	// Initially only get titles for the graph structure
	const initialProps = ['title'];
	const allObjects = await collection.query.fetchObjects({
		limit: 100,
		returnProperties: initialProps
	});

	if (!allObjects.objects.length) return { visualization: null };

	// Get media type indicators in a separate, lighter query
	const mediaTypes = new Map<string, MediaType>();

	// Batch process objects to check media types
	const batchSize = 10;
	for (let i = 0; i < allObjects.objects.length; i += batchSize) {
		const batch = allObjects.objects.slice(i, i + batchSize);
		const batchQueries = batch.map((obj) =>
			collection.query.fetchObjectById(obj.uuid, {
				returnProperties: ['title'].concat(
					properties.filter((p) => ['image', 'audio', 'video', 'text'].includes(p))
				)
			})
		);

		const results = await Promise.all(batchQueries);

		results.forEach((result) => {
			if (!result) return;
			const obj = result;
			if (obj.properties['image'] !== undefined) mediaTypes.set(obj.uuid, 'image');
			else if (obj.properties['audio'] !== undefined) mediaTypes.set(obj.uuid, 'audio');
			else if (obj.properties['video'] !== undefined) mediaTypes.set(obj.uuid, 'video');
			else if (obj.properties['text'] !== undefined) mediaTypes.set(obj.uuid, 'text');
			else {
				const title = obj.properties['title']?.toString().toLowerCase() || '';
				if (title.includes('image')) mediaTypes.set(obj.uuid, 'image');
				else if (title.includes('audio')) mediaTypes.set(obj.uuid, 'audio');
				else if (title.includes('video')) mediaTypes.set(obj.uuid, 'video');
				else mediaTypes.set(obj.uuid, 'text');
			}
		});
	}

	// Attach media types to objects
	allObjects.objects.forEach((obj) => {
		obj.properties.mediaType = mediaTypes.get(obj.uuid) || 'text';
	});

	const relations: Relation[] = [];
	const seen = new Set<string>();

	// First, find semantic matches (same base name)
	for (const obj of allObjects.objects) {
		const sourceBase = obj.properties['title']?.toString().split('_')[0];
		if (!sourceBase) continue;

		for (const target of allObjects.objects) {
			if (obj.uuid === target.uuid) continue;

			const targetBase = target.properties['title']?.toString().split('_')[0];
			if (!targetBase || sourceBase !== targetBase) continue;

			const key = [obj.uuid, target.uuid].sort().join('-');
			if (seen.has(key)) continue;

			seen.add(key);
			relations.push({
				source: obj.uuid,
				target: target.uuid,
				distance: 0.3, // Fixed distance for semantic matches
				key
			});
		}
	}

	// Then, find vector similarity matches
	for (const obj of allObjects.objects) {
		const similar = await collection.query.nearObject(obj.uuid, {
			returnMetadata: ['distance'],
			returnProperties: initialProps, // Use the same properties as initial fetch
			limit: 5,
			certainty: 0.1
		});

		for (const target of similar.objects) {
			if (target.uuid === obj.uuid) continue;

			const distance = target.metadata?.distance;
			if (distance === undefined) continue;

			const key = [obj.uuid, target.uuid].sort().join('-');
			if (seen.has(key)) continue;

			seen.add(key);
			relations.push({
				source: obj.uuid,
				target: target.uuid,
				distance,
				key
			});
		}
	}

	// Sort relations by distance for better visualization
	const sortedRelations = relations.sort((a, b) => a.distance - b.distance);

	return {
		visualization: {
			objects: allObjects.objects,
			relations: sortedRelations,
			availableMedia: properties.filter((p) => ['image', 'audio', 'video', 'text'].includes(p))
		}
	};
};
