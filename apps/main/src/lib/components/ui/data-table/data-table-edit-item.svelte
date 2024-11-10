<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { activeCollection } from '$lib/stores';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let {
		open = $bindable(false),
		action,
		row,
		fileType
	} = $props<{
		open: boolean;
		action: string;
		row: {
			title: string;
			uuid: string;
			original: {
				fileData?: string;
				mimeType?: string;
			};
		};
		fileType: string;
	}>();

	let title = $state(row.title);
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<form
			method="post"
			action={`?/${action}`}
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						open = false;
						toast.success(`${title} updated successfully`);
					}
					update();
				};
			}}
		>
			<Dialog.Header>
				<Dialog.Title>Edit {fileType}</Dialog.Title>
				<Dialog.Description>
					Make changes to your {fileType}. Click save when you're done.
				</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="title" class="text-right">Title</Label>
					<Input id="title" bind:value={title} name="title" class="col-span-3" />
					<input type="hidden" name="uuid" value={row.uuid} />
					<input type="hidden" name="collectionName" value={$activeCollection?.name} />
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
				<Button type="submit">Save changes</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
