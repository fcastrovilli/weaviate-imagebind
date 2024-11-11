import type { SimulationNodeDatum } from 'd3';

export type MediaType = 'audio' | 'image' | 'text' | 'video';

export interface NetworkNode extends SimulationNodeDatum {
	id: string;
	title: string;
	type: MediaType;
	uuid: string;
	x?: number;
	y?: number;
	fx?: number | null;
	fy?: number | null;
}

export interface NetworkLink {
	source: NetworkNode;
	target: NetworkNode;
	value: number;
}

export interface NetworkData {
	nodes: NetworkNode[];
	links: NetworkLink[];
}

export interface WeaviateMetadata {
	size?: number;
	duration?: number;
	format?: string;
	width?: number;
	height?: number;
}

export interface WeaviateProperties {
	title: string;
	audioMetadata?: WeaviateMetadata;
	imageMetadata?: WeaviateMetadata;
	videoMetadata?: WeaviateMetadata;
	text?: string;
}

export interface WeaviateObject {
	metadata: Record<string, unknown>;
	properties: WeaviateProperties;
	uuid: string;
	vectors: Record<string, unknown>;
}
