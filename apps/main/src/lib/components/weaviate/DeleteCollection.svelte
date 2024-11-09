<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Trash from 'lucide-svelte/icons/trash';
	import { toast } from 'svelte-sonner';

	let { collectionName }: { collectionName: string } = $props();
	let isOpen = $state(false);
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger>
		<Button variant="destructive">
			Delete Collection
			<Trash class="size-4" />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<form
			action="/collections?/deleteCollectionAction"
			method="POST"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						isOpen = false;
						toast.success(`Collection deleted successfully`);
					}
					update();
				};
			}}
			class="flex flex-col gap-4"
		>
			<Dialog.Header>
				<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
				<Dialog.Description>
					This action cannot be undone. This will permanently delete this collection and remove your
					data from our servers.
				</Dialog.Description>
				<input type="hidden" id="collectionName" name="collectionName" value={collectionName} />
			</Dialog.Header>
			<Dialog.Footer>
				<Button type="submit">Delete Collection</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
