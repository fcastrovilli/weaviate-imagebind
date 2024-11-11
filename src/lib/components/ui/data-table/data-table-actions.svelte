<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import DataTableDeleteItem from './data-table-delete-item.svelte';
	import DataTableEditItem from './data-table-edit-item.svelte';
	import { getFileData } from '$lib/utils/files';

	let { row, action, fileType } = $props<{
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
			const processedData = getFileData(
				row.original.fileData,
				row.original.mimeType,
				fileType as 'audio' | 'image'
			);

			if (processedData) {
				const blob = new Blob([processedData.buffer], { type: processedData.mimeType });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = `${row.title}.${processedData.extension}`;
				link.click();
				URL.revokeObjectURL(url);
			}
		}
	}
</script>

<DataTableEditItem {fileType} {row} bind:open={editDialogOpen} {action} />
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
