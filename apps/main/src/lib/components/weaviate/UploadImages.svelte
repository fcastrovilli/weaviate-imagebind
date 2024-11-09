<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Upload Images</Card.Title>
		<Card.Description>Add images to your collection</Card.Description>
	</Card.Header>
	<Card.Content>
		<form
			method="post"
			use:enhance={() => {
				return async ({ result, update }) => {
					console.log(result);
					update();
				};
			}}
			action="?/uploadImagesAction"
			enctype="multipart/form-data"
			class="flex flex-col gap-2"
		>
			<div class="flex flex-col gap-2">
				<Label for="imagefiles">Image Files</Label>
				<input id="imagefiles" type="file" name="imagefiles" accept="image/*" multiple />
			</div>
			<Button type="submit">Upload</Button>
		</form>
	</Card.Content>
</Card.Root>
