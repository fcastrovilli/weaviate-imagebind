import type { ColumnDef } from '@tanstack/table-core';
import type { WeaviateNonGenericObject } from 'weaviate-client';
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/render-helpers.js';
import DataTableCheckbox from '$lib/components/ui/data-table/data-table-checkbox.svelte';
import AudioPreviewDialog from './audio-preview-dialog.svelte';
import DataTableActions from '$lib/components/ui/data-table/data-table-actions.svelte';
import DataTableTitleButton from '$lib/components/ui/data-table/data-table-title-button.svelte';
import DataTableDateButton from '$lib/components/ui/data-table/data-table-date-button.svelte';

export const columns: ColumnDef<WeaviateNonGenericObject>[] = [
	{
		id: 'select',
		header: ({ table }) =>
			renderComponent(DataTableCheckbox, {
				checked: table.getIsAllPageRowsSelected()
					? true
					: table.getIsSomePageRowsSelected()
						? false
						: undefined,
				onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
				'aria-label': 'Select all'
			}),
		cell: ({ row }) =>
			renderComponent(DataTableCheckbox, {
				checked: row.getIsSelected(),
				onCheckedChange: (value) => row.toggleSelected(!!value),
				'aria-label': 'Select row'
			}),
		enableSorting: false,
		enableHiding: false
	},
	{
		id: 'uuid',
		accessorFn: (row) => row.uuid,
		enableSorting: false,
		enableHiding: true,
		enableColumnFilter: false
	},
	{
		id: 'title',
		accessorFn: (row) => row.properties.title,
		header: ({ column }) =>
			renderComponent(DataTableTitleButton, {
				onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
			}),
		cell: ({ row }) => {
			const titleSnippet = createRawSnippet<[string]>((getTitle) => {
				const title = getTitle();
				return {
					render: () => `<div class="font-medium">${title}</div>`
				};
			});
			return renderSnippet(titleSnippet, row.getValue<string>('title'));
		},
		enableSorting: true,
		enableHiding: true
	},
	{
		id: 'audio',
		header: 'Audio',
		accessorFn: (row) => row.properties.audio,
		cell: ({ row }) => {
			return renderComponent(AudioPreviewDialog, {
				audio: row.getValue<string>('audio'),
				title: row.getValue<string>('title'),
				uuid: row.original.uuid
			});
		},
		enableHiding: true
	},
	{
		id: 'actions',
		header: 'Actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				action: 'updateAudioAction',
				fileType: 'audio',
				row: {
					title: row.getValue<string>('title'),
					uuid: row.original.uuid,
					original: {
						fileData: row.getValue<string>('audio'),
						mimeType: 'audio/mpeg'
					}
				}
			});
		},
		enableSorting: false,
		enableHiding: true
	},
	{
		id: 'createdAt',
		accessorFn: (row) => row.properties.createdAt as string,
		header: ({ column }) => {
			return renderComponent(DataTableDateButton, {
				onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
			});
		}
	}
];
