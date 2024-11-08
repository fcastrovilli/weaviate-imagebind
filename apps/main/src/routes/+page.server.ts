import { getImages, queryImages, uploadImage } from '$lib/server/db/utils';
import type { BatchObjectsReturn, WeaviateNonGenericObject } from 'weaviate-client';

export const load = async () => {
	const images: WeaviateNonGenericObject[] | null = await getImages('Imagetest');
	return { images };
};

export const actions = {
	uploadImages: async ({ request }) => {
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
	},
	queryImages: async ({ request }) => {
		const formData = await request.formData();
		const imageBlob = formData.get('imagefile') as File;
		const image = await imageBlob
			.arrayBuffer()
			.then((buffer) => Buffer.from(buffer).toString('base64'));
		const result = await queryImages('Imagetest', image, 5);
		return result;
	}
};
