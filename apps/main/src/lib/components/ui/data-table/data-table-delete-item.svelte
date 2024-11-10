<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { activeCollection } from '$lib/stores';

	let {
		fileType,
		uuid,
		open = $bindable(false)
	} = $props<{
		fileType: string;
		uuid: string;
		open: boolean;
	}>();
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<form
			method="POST"
			action={`?/delete${fileType.charAt(0).toUpperCase() + fileType.slice(1)}Action`}
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						open = false;
						toast.success(
							`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} deleted successfully`
						);
						update();
					} else {
						toast.error(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} deletion failed`);
					}
				};
			}}
			class="flex flex-col gap-4"
		>
			<Dialog.Header>
				<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
				<Dialog.Description>
					This action cannot be undone. This will permanently delete this {fileType} and remove your
					data from our servers.
				</Dialog.Description>
				<input type="hidden" name="collectionName" value={$activeCollection?.name} />
				<input type="hidden" name="uuid" value={uuid} />
			</Dialog.Header>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				<Button type="submit" variant="destructive">Delete {fileType}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
