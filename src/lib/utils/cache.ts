import { browser } from '$app/environment';

// Cache for media data
export const mediaCache = new Map<string, string>();

export const getCachedMediaData = async (
	uuid: string,
	mediaType: string,
	fetchCallback: () => Promise<Response>
): Promise<string | null> => {
	const cacheKey = `${uuid}-${mediaType}`;

	// Only use cache in browser
	if (browser && mediaCache.has(cacheKey)) {
		console.log('Returning cached media data for:', cacheKey);
		return mediaCache.get(cacheKey) || null;
	}

	console.log('Fetching media data for:', cacheKey);
	const response = await fetchCallback();

	if (!response.ok) {
		console.error('Failed to fetch media data:', response.statusText);
		return null;
	}

	const result = await response.json();

	if (result.success && result.mediaData) {
		// Cache the result in browser
		if (browser) {
			mediaCache.set(cacheKey, result.mediaData);
		}
		return result.mediaData;
	}

	return null;
};
