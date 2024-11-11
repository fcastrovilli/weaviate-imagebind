import type { ModuleConfig, Property } from 'weaviate-client';

export interface VectorizerConfig {
	audioFields?: { name: string; weight: number }[];
	imageFields?: { name: string; weight: number }[];
	textFields?: { name: string; weight: number }[];
	videoFields?: { name: string; weight: number }[];
	name?: string;
}

export interface CollectionInterface {
	name: string;
	description: string;
	config: {
		vectorizers: ModuleConfig<'multi2vec-bind', VectorizerConfig>[];
		properties: Property[];
		references: Property[];
		mediaTypes: ('audio' | 'image' | 'text' | 'video')[];
	};
}
