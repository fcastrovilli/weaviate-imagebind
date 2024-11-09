import type { PropertyConfig, ReferenceConfig, VectorConfig } from 'weaviate-client';

export interface CollectionInterface {
	name: string;
	description: string | undefined;
	config: {
		vectorizers: VectorConfig;
		properties: PropertyConfig[];
		references: ReferenceConfig[];
	};
}
