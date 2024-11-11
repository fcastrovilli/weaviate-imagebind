import type { SimulationNodeDatum } from 'd3';
import type { WeaviateObject, WeaviateField } from 'weaviate-client';

export type MediaType = 'audio' | 'image' | 'text' | 'video';

export interface Relation {
	source: string;
	target: string;
	distance: number;
	key: string;
}

// Define Weaviate's field types
export interface WeaviateProperties {
	[key: string]: WeaviateField;
}

// Define our expected property structure
export interface ObjectProperties {
	title: string;
	data: string; // Base64 encoded media data
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

export type MediaObject = WeaviateObject<WeaviateProperties>;

// D3 Graph types
export interface GraphNode extends SimulationNodeDatum {
	id: string;
	label: string;
	type: MediaType;
	weight: number;
}

export interface GraphLink {
	source: GraphNode;
	target: GraphNode;
	strength: number;
}
