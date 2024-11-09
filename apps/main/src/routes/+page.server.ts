import {
	createImageCollectionAction,
	deleteCollectionAction,
	queryImagesAction,
	uploadImagesAction
} from '$lib/server/db/actions.js';

export const actions = {
	uploadImagesAction,
	queryImagesAction,
	createImageCollectionAction,
	deleteCollectionAction
};
