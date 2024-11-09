import type { ColumnDef } from '@tanstack/table-core';
import type { WeaviateNonGenericObject } from 'weaviate-client';
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
import DataTableCheckbox from './data-table/data-table-checkbox.svelte';
import ImagePreviewDialog from './image-preview-dialog.svelte';
import DataTableActions from './data-table/data-table-actions.svelte';
import DataTableTitleButton from './data-table/data-table-title-button.svelte';

export const columns: ColumnDef<WeaviateNonGenericObject>[] = [
	{
		id: 'select',
		header: ({ table }) =>
			renderComponent(DataTableCheckbox, {
				checked:
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate'),
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
		id: 'image',
		header: 'Image',
		accessorFn: (row) => row.properties.image,
		cell: ({ row }) => {
			return renderComponent(ImagePreviewDialog, {
				image: row.getValue<string>('image'),
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
				image: row.getValue<string>('image'),
				title: row.getValue<string>('title'),
				uuid: row.original.uuid
			});
		},
		enableSorting: false,
		enableHiding: true
	}
];
