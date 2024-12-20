import type { MediaObject, MediaType, GraphNode, GraphLink } from '$lib/types/visualization';
import * as d3 from 'd3';

export const GRAPH_DEFAULTS = {
	width: 800,
	height: 600,
	nodeRadius: 8,
	initialParams: {
		distanceThreshold: 0.35,
		linkDistance: 45,
		linkStrength: 0.2,
		chargeStrength: -120,
		centerStrength: 0.1,
		collisionStrength: 0.35
	}
};

export const COLORS: Record<MediaType, string> = {
	audio: '#FF4136',
	image: '#7FDBFF',
	video: '#01FF70',
	text: '#FFDC00'
};

export function getMediaType(obj: MediaObject): MediaType {
	// Use pre-determined media type if available
	if ('mediaType' in obj.properties) {
		return obj.properties.mediaType as MediaType;
	}

	// Fallback to checking properties
	if ('image' in obj.properties) return 'image';
	if ('audio' in obj.properties) return 'audio';
	if ('video' in obj.properties) return 'video';
	if ('text' in obj.properties) return 'text';

	// Final fallback to title-based detection
	const title = obj.properties['title']?.toString().toLowerCase() || '';
	if (title.includes('image')) return 'image';
	if (title.includes('audio')) return 'audio';
	if (title.includes('video')) return 'video';

	return 'text';
}

export function createForceSimulation(
	nodes: GraphNode[],
	width: number,
	height: number
): d3.Simulation<GraphNode, GraphLink> {
	return d3
		.forceSimulation<GraphNode>(nodes)
		.force(
			'link',
			d3.forceLink<GraphNode, GraphLink>().id((d) => d.id)
		)
		.force('charge', d3.forceManyBody())
		.force('center', d3.forceCenter(width / 2, height / 2))
		.force('collision', d3.forceCollide());
}

export function initializeNodePositions(nodes: GraphNode[], width: number, height: number): void {
	nodes.forEach((node, i) => {
		const angle = (i / nodes.length) * 2 * Math.PI;
		const radius = Math.min(width, height) / 4;
		node.x = width / 2 + radius * Math.cos(angle);
		node.y = height / 2 + radius * Math.sin(angle);
	});
}
