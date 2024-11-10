<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { activeCollection } from '$lib/stores';

	let {
		fileType = 'file',
		fileData,
		title,
		uuid,
		mimeType = 'application/octet-stream'
	}: {
		fileType?: 'image' | 'audio' | 'video' | 'text' | 'file';
		fileData: string;
		title: string;
		uuid: string;
		mimeType?: string;
	} = $props();

	const dataUrl = `data:${mimeType};base64,${fileData}`;
</script>

<form
	method="POST"
	action={`?/delete${fileType.charAt(0).toUpperCase() + fileType.slice(1)}`}
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success(
					`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} deleted successfully`
				);
				update();
			} else {
				toast.error(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} deletion failed`);
			}
		};
	}}
>
	<input type="hidden" name="collectionName" value={$activeCollection?.name} />
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
						link.href = dataUrl;
						link.download = `${title}.${fileType}`;
						link.click();
					}}
				>
					Download
				</DropdownMenu.Item>
				{#if fileType === 'image' || fileType === 'video' || fileType === 'audio'}
					<DropdownMenu.Item onclick={() => window.open(dataUrl, '_blank')}>
						View in new tab
					</DropdownMenu.Item>
				{/if}
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
