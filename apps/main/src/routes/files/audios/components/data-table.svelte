<script lang="ts">
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import type { WeaviateNonGenericObject } from 'weaviate-client';
	import type { ColumnDef } from '@tanstack/table-core';

	let {
		data,
		columns
	}: {
		data: WeaviateNonGenericObject[] | null;
		columns: ColumnDef<WeaviateNonGenericObject, unknown>[];
	} = $props();
</script>

<DataTable {data} {columns} fileType="audio" mimeType="audio/mpeg" />
