<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '../ui/label/index.js';
	import { enhance } from '$app/forms';
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>New Collection</Card.Title>
		<Card.Description>Create a new collection for your images</Card.Description>
	</Card.Header>
	<Card.Content>
		<form
			use:enhance
			method="POST"
			action="?/createImageCollectionAction"
			class="flex flex-col gap-2"
		>
			<div class="flex flex-col gap-2">
				<Label for="collectionName">Collection Name</Label>
				<Input id="collectionName" name="collectionName" type="text" />
			</div>
			<Button type="submit">Create Collection</Button>
		</form>
	</Card.Content>
</Card.Root>
