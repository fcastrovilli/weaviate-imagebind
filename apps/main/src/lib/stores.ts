import { writable } from 'svelte/store';
import type { CollectionConfig } from 'weaviate-client';
import { invalidate } from '$app/navigation';

const STORAGE_KEY = 'lastSelectedCollection';

const createActiveCollectionStore = () => {
	// Try to get stored collection name from localStorage
	const storedCollectionName =
		typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

	const store = writable<CollectionConfig | null>(null);

	return {
		...store,
		set: async (value: CollectionConfig | null) => {
			if (value?.name && typeof localStorage !== 'undefined') {
				localStorage.setItem(STORAGE_KEY, value.name);
				document.cookie = `${STORAGE_KEY}=${value.name};path=/`;
			} else if (typeof localStorage !== 'undefined') {
				localStorage.removeItem(STORAGE_KEY);
				document.cookie = `${STORAGE_KEY}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
			}
			store.set(value);
			// Invalidate all routes that depend on the collection
			await invalidate('app:collection');
		},
		// Method to initialize the store with collections data
		initializeFromStorage: async (collections: CollectionConfig[]) => {
			if (storedCollectionName && collections.length > 0) {
				const savedCollection = collections.find(
					(c) => c.name.toLowerCase() === storedCollectionName.toLowerCase()
				);
				if (savedCollection) {
					await store.set(savedCollection);
				}
			}
		}
	};
};

export const activeCollection = createActiveCollectionStore();
