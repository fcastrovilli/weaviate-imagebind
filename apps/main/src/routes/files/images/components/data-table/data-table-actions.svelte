<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let { image, title, uuid }: { image: string; title: string; uuid: string } = $props();

	const imageSource = `data:image/jpeg;base64,${image}`;
</script>

<form
	method="POST"
	action="?/deleteImage"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('Image deleted successfully');
				update();
			} else {
				toast.error('Image deletion failed');
			}
		};
	}}
>
	<input type="hidden" name="uuid" value={uuid} />
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Button variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis class="size-4" />
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			<DropdownMenu.Group>
				<DropdownMenu.Label>Actions</DropdownMenu.Label>
				<DropdownMenu.Item
					onclick={() => {
						const link = document.createElement('a');
						link.href = imageSource;
						link.download = `${title}.jpg`;
						link.click();
					}}
				>
					Download
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={() => window.open(imageSource, '_blank')}>
					View in new tab
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					<button
						type="submit"
						class="w-full text-left text-destructive focus:bg-destructive focus:text-destructive-foreground"
					>
						Delete
					</button>
				</DropdownMenu.Item>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</form>
