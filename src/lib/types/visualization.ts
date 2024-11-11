import type { SimulationNodeDatum } from 'd3';
import type { WeaviateObject } from 'weaviate-client';

export type MediaType = 'audio' | 'image' | 'text' | 'video';

// Define the properties structure that matches our Weaviate schema
export interface ObjectProperties {
	title: string;
	audioMetadata?: {
		duration?: number;
		format?: string;
		size?: number;
	};
	imageMetadata?: {
		width?: number;
		height?: number;
		format?: string;
		size?: number;
	};
	videoMetadata?: {
		duration?: number;
		format?: string;
		size?: number;
	};
	text?: string;
}

// Use WeaviateObject with our properties type
export type MediaObject = WeaviateObject<ObjectProperties>;

// Custom node data interface
export interface NodeData {
	id: string;
	label: string;
	type: MediaType;
	weight: number;
}

// D3 Graph types - combine SimulationNodeDatum with our custom data
export interface GraphNode extends NodeData, Omit<SimulationNodeDatum, keyof NodeData> {
	x?: number;
	y?: number;
	fx?: number | null;
	fy?: number | null;
}

export interface GraphLink {
	source: GraphNode;
	target: GraphNode;
	strength: number;
}

// Add type for D3 selections
export type D3Selection = d3.Selection<d3.BaseType, unknown, null, undefined>;
