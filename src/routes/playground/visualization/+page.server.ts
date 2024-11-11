import { getCollection } from '$lib/server/db/collections';

interface Relation {
	source: string;
	target: string;
	distance: number;
	key: string;
}

export const load = async ({ cookies, depends }) => {
	depends('app:collection');
	const collectionName = cookies.get('lastSelectedCollection');

	const collection = await getCollection(collectionName!);
	if (!collection) return { visualization: null };

	// Get initial objects
	const allObjects = await collection.query.fetchObjects({
		limit: 100
	});

	if (!allObjects.objects.length) return { visualization: null };

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
			limit: 5 // Only get top 3 most similar objects
		});

		for (const target of similar.objects) {
			if (target.uuid === obj.uuid) continue;

			const distance = target.metadata?.distance;
			if (distance === undefined || distance > 0.35) continue;

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
			relations: sortedRelations
		}
	};
};
