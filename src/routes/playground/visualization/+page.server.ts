import { getCollection } from '$lib/server/db/collections';

export const load = async ({ cookies, depends }) => {
	depends('app:collection');
	const collectionName = cookies.get('lastSelectedCollection');

	const collection = await getCollection(collectionName!);
	if (!collection) return { visualization: null };

	// Get initial objects
	const allObjects = await collection.query.fetchObjects({
		limit: 15 // Adjust based on your needs
	});

	if (!allObjects.objects.length) return { visualization: null };

	// Create relations based on vector similarity
	const relations = [];
	const seen = new Set<string>();

	// Compare each object with every other object
	for (let i = 0; i < allObjects.objects.length; i++) {
		const obj = allObjects.objects[i];
		const similar = await collection.query.nearObject(obj.uuid, {
			returnMetadata: ['distance'],
			limit: allObjects.objects.length // Get all possible connections
		});

		// Only keep connections with distance < 0.5 (more similar objects)
		for (const similarObj of similar.objects) {
			// Skip self-references
			if (similarObj.uuid === obj.uuid) continue;

			// Get distance safely with fallback
			const distance = similarObj.metadata?.distance;
			if (distance === undefined || distance > 0.5) continue;

			const key = [obj.uuid, similarObj.uuid].sort().join('-');
			if (seen.has(key)) continue; // Skip if we already have this connection

			seen.add(key);
			relations.push({
				source: obj.uuid,
				target: similarObj.uuid,
				distance,
				key
			});
		}
	}

	return {
		visualization: {
			objects: allObjects.objects,
			relations
		}
	};
};
