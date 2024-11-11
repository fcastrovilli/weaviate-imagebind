export const AUDIO_MIME_TYPES: Record<string, string> = {
	mp3: 'audio/mpeg',
	wav: 'audio/wav',
	ogg: 'audio/ogg',
	m4a: 'audio/mp4'
};

export const IMAGE_MIME_TYPES: Record<string, string> = {
	jpeg: 'image/jpeg',
	jpg: 'image/jpeg',
	png: 'image/png',
	gif: 'image/gif',
	webp: 'image/webp'
};

const getFileExtension = (mimeType: string, mimeTypes: Record<string, string>): string => {
	const entry = Object.entries(mimeTypes).find(([, mime]) => mime === mimeType);
	return entry ? entry[0] : Object.keys(mimeTypes)[0]; // default to first extension
};

// Helper function to convert base64 to Uint8Array
function base64ToUint8Array(base64: string, mimeType: string) {
	// Ensure the data has the correct prefix
	if (!base64.startsWith('data:')) {
		base64 = `data:${mimeType};base64,${base64}`;
	}

	// Extract the base64 data after the comma
	const base64Data = base64.split(',')[1];

	// First, decode the base64 string to a binary string
	const binaryString = atob(base64Data);
	// Create a new Uint8Array with the correct length
	const bytes = new Uint8Array(binaryString.length);
	// Fill the array with the binary data
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
}

export const getFileData = (fileString: string, mimeType: string, fileType: 'audio' | 'image') => {
	try {
		// Convert base64 to Uint8Array
		const uint8Array = base64ToUint8Array(fileString, mimeType);

		const mimeTypes = fileType === 'audio' ? AUDIO_MIME_TYPES : IMAGE_MIME_TYPES;
		const defaultMime = fileType === 'audio' ? AUDIO_MIME_TYPES.mp3 : IMAGE_MIME_TYPES.jpeg;

		return {
			buffer: uint8Array,
			extension: getFileExtension(mimeType, mimeTypes),
			mimeType: mimeType || defaultMime
		};
	} catch (error) {
		console.error(`Error processing ${fileType} data:`, error);
		return null;
	}
};
