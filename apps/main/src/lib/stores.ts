import { writable } from 'svelte/store';
import type { CollectionConfig } from 'weaviate-client';

export const activeCollection = writable<CollectionConfig | null>(null);
