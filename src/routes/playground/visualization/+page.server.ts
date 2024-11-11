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

	// Get cross-modal relationships using vector similarity
	const similarityPromises = allObjects.objects.map(async (obj) => {
		return collection.query.nearObject(obj.uuid, {
			returnMetadata: ['distance'],
			limit: 10, // Get top 10 most similar objects
			certainty: 0.6 // Adjust based on desired similarity threshold
		});
	});

	const similarityResults = await Promise.all(similarityPromises);

	// Process similarity results
	similarityResults.forEach((result, index) => {
		const sourceObj = allObjects.objects[index];

		result.objects
			.filter((targetObj) => {
				if (targetObj.uuid === sourceObj.uuid) return false;
				const distance = targetObj.metadata?.distance;
				if (distance === undefined) return false;

				// Keep stronger connections
				return distance < 0.4;
			})
			.forEach((targetObj) => {
				const distance = targetObj.metadata?.distance ?? 1;
				const key = [sourceObj.uuid, targetObj.uuid].sort().join('-');
				if (seen.has(key)) return;

				seen.add(key);
				relations.push({
					source: sourceObj.uuid,
					target: targetObj.uuid,
					distance,
					key
				});
			});
	});

	// Sort relations by distance for better visualization
	const sortedRelations = relations.sort((a, b) => a.distance - b.distance);

	return {
		visualization: {
			objects: allObjects.objects,
			relations: sortedRelations
		}
	};
};
