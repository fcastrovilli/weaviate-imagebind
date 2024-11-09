<script lang="ts">
	import type { WeaviateNonGenericObject } from 'weaviate-client';
	import { columns } from './columns.js';
	import DataTable from './data-table.svelte';

	let { data } = $props();
</script>

<DataTable data={data.images} {columns} />
