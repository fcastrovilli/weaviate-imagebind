<script lang="ts">
	import type { WeaviateNonGenericObject } from 'weaviate-client';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { enhance } from '$app/forms';
	import { activeCollection } from '$lib/stores';
	import ViewImages from './ViewImages.svelte';

	let queryResult: WeaviateNonGenericObject[] | null = $state(null);
</script>

<h2 class="text-2xl font-bold">Compare Images</h2>
<form
	method="post"
	action="?/queryImagesAction"
	enctype="multipart/form-data"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				queryResult = result.data?.objects as unknown as WeaviateNonGenericObject[];
			}
			update();
		};
	}}
	class="flex flex-col gap-2"
>
	<div class="flex flex-col gap-2">
		<input type="hidden" name="collectionName" value={$activeCollection?.name} />
		<Label for="imagefile">Image File</Label>
		<input id="imagefile" type="file" name="imagefile" accept="image/*" />
	</div>
	<Button type="submit">Compare Image</Button>
</form>

<ViewImages bind:images={queryResult} />
