<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import DataTableDeleteItem from './data-table-delete-item.svelte';

	let { row, fileType } = $props<{
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

	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);

	function handleView() {
		if (
			row.original?.fileData &&
			row.original?.mimeType &&
			(fileType === 'image' || fileType === 'video' || fileType === 'audio')
		) {
			const dataUrl = `data:${row.original.mimeType};base64,${row.original.fileData}`;
			window.open(dataUrl, '_blank');
		}
	}

	function handleUpdate() {
		editDialogOpen = true;
	}

	function handleDownload() {
		if (row.original?.fileData && row.original?.mimeType) {
			const dataUrl = `data:${row.original.mimeType};base64,${row.original.fileData}`;
			const link = document.createElement('a');
			link.href = dataUrl;
			link.download = `${row.title}.${fileType}`;
			link.click();
		}
	}
</script>

<DataTableDeleteItem {fileType} uuid={row.uuid} bind:open={deleteDialogOpen} />

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis class="size-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			{#if fileType === 'image' || fileType === 'video' || fileType === 'audio'}
				<DropdownMenu.Item onclick={handleView}>View</DropdownMenu.Item>
			{/if}
			<DropdownMenu.Item onclick={handleUpdate}>Update</DropdownMenu.Item>
			<DropdownMenu.Item onclick={handleDownload}>Download</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item
				onclick={() => (deleteDialogOpen = true)}
				class="text-destructive focus:bg-destructive focus:text-destructive-foreground"
			>
				Delete
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
