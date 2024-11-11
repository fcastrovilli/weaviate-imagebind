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

	// Get semantic relationships from Weaviate
	for (const obj of allObjects.objects) {
		const similar = await collection.query.nearObject(obj.uuid, {
			returnMetadata: ['distance'],
			limit: allObjects.objects.length // Get all possible matches
		});

		// Process similarity results
		for (const target of similar.objects) {
			// Skip self-references
			if (target.uuid === obj.uuid) continue;

			// Get distance safely with fallback
			const distance = target.metadata?.distance;
			if (distance === undefined) continue;

			// Create unique key for this relationship
			const key = [obj.uuid, target.uuid].sort().join('-');
			if (seen.has(key)) continue;

			// Keep stronger connections (distance < 0.4) and semantic matches
			const sourceTitle = obj.properties['title'];
			const targetTitle = target.properties['title'];
			const isSemantic =
				sourceTitle?.toString().split('_')[0] === targetTitle?.toString().split('_')[0];

			if (distance < 0.4 || isSemantic) {
				seen.add(key);
				relations.push({
					source: obj.uuid,
					target: target.uuid,
					distance: isSemantic ? Math.min(distance, 0.3) : distance, // Boost semantic matches
					key
				});
			}
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
