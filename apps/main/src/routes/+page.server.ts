import { uploadImage } from '$lib/server/db/utils';
import type { BatchObjectsReturn } from 'weaviate-client';

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		let result: BatchObjectsReturn<undefined> | null = null;
		const imageBlobs = formData.getAll('imagefiles') as File[];
		const imageFiles: { title: string; image: string }[] = [];
		if (imageBlobs.length > 0) {
			for (const imageBlob of imageBlobs) {
				imageFiles.push({
					title: imageBlob.name,
					image: await imageBlob
						.arrayBuffer()
						.then((buffer) => Buffer.from(buffer).toString('base64'))
				});
			}
			result = await uploadImage('Imagetest', imageFiles);
		}
		return { result };
	}
};
