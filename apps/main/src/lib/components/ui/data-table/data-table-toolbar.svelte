<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import Trash from 'lucide-svelte/icons/trash';
	import Download from 'lucide-svelte/icons/download';
	import type { Table } from '@tanstack/table-core';
	import { toast } from 'svelte-sonner';
	import JSZip from 'jszip';
	import { enhance } from '$app/forms';
	import type { WeaviateNonGenericObject } from 'weaviate-client';
	import { activeCollection } from '$lib/stores';
	import { getFileData } from '$lib/utils/files';
	import { browser } from '$app/environment';

	interface FileMetadata {
		format: string;
		size: number;
		[key: string]: unknown;
	}

	let {
		table,
		fileType = 'file'
	}: {
		table: Table<WeaviateNonGenericObject>;
		fileType?: 'image' | 'audio' | 'video' | 'text' | 'file';
	} = $props();

	// Helper function to get the correct file type for action names
	function getActionFileType(fileType: string) {
		if (!browser) return;
		if (fileType === 'file') {
			// Check if we're in the images or audios route
			if (window.location.pathname.includes('/files/images')) {
				return 'Image';
			} else if (window.location.pathname.includes('/files/audios')) {
				return 'Audio';
			}
		}
		return fileType.charAt(0).toUpperCase() + fileType.slice(1);
	}

	async function handleBulkDownload() {
		const selectedRows = table.getSelectedRowModel().rows;
		const zip = new JSZip();

		// Add each file to the zip
		for (const row of selectedRows) {
			// Map file type to property name
			let propertyName: string;
			let actualFileType: 'audio' | 'image';

			// Check what kind of file we're dealing with by looking at the properties
			if (fileType === 'file') {
				if (row.original.properties.image) {
					propertyName = 'image';
					actualFileType = 'image';
				} else if (row.original.properties.audio) {
					propertyName = 'audio';
					actualFileType = 'audio';
				} else {
					console.log('Skipping - unknown file type');
					continue;
				}
			} else {
				propertyName = fileType;
				actualFileType = fileType as 'audio' | 'image';
			}

			const fileData = row.original.properties[propertyName];
			const metadata = row.original.properties[`${propertyName}Metadata`] as
				| FileMetadata
				| undefined;
			const mimeType = metadata?.format || '';
			const title = row.original.properties.title as string;

			if (!fileData || typeof fileData !== 'string') {
				continue;
			}

			const processedData = getFileData(fileData, mimeType, actualFileType);

			if (processedData) {
				zip.file(`${title}.${processedData.extension}`, processedData.buffer);
			} else {
				console.log('Failed to process data');
			}
		}

		// Generate and download zip
		const content = await zip.generateAsync({
			type: 'blob',
			compression: 'DEFLATE',
			compressionOptions: {
				level: 9
			}
		});

		console.log('Zip size:', content.size);

		const url = window.URL.createObjectURL(content);
		const link = document.createElement('a');
		link.href = url;
		link.download = `${fileType}s.zip`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	}
</script>

<div class="flex w-full items-center justify-between gap-4 py-4">
	<Input
		placeholder="Filter titles..."
		value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
		oninput={(e) => table.getColumn('title')?.setFilterValue(e.currentTarget.value)}
		onchange={(e) => table.getColumn('title')?.setFilterValue(e.currentTarget.value)}
		class="max-w-sm"
	/>
	<form
		method="POST"
		action={`?/deleteBulk${getActionFileType(fileType)}sAction`}
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'success') {
					toast.success(`Files deleted successfully`);
					update();
				} else {
					toast.error(`Files deletion failed`);
				}
			};
		}}
	>
		<input type="hidden" name="collectionName" value={$activeCollection?.name} />
		<input
			type="hidden"
			name="uuids"
			value={JSON.stringify(table.getSelectedRowModel().rows.map((row) => row.original.uuid))}
		/>
		{#if table.getSelectedRowModel().rows.length > 0}
			<div class="ml-4 flex items-center space-x-2">
				<Button variant="outline" size="sm" onclick={handleBulkDownload}>
					<Download class="mr-2 size-4" />
					Download ({table.getSelectedRowModel().rows.length})
				</Button>
				<Button type="submit" variant="destructive" size="sm">
					<Trash class="mr-2 size-4" />
					Delete ({table.getSelectedRowModel().rows.length})
				</Button>
			</div>
		{/if}
	</form>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Button variant="outline" class="ml-auto">
				Columns <ChevronDown class="ml-2 size-4" />
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			{#each table.getAllColumns().filter((col) => col.getCanHide()) as column}
				<DropdownMenu.CheckboxItem
					class="capitalize"
					controlledChecked
					checked={column.getIsVisible()}
					onCheckedChange={(value) => column.toggleVisibility(!!value)}
				>
					{column.id}
				</DropdownMenu.CheckboxItem>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
