<script lang="ts">
	import UploadImages from './components/UploadImages.svelte';
	import { columns } from './components/columns.js';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import * as Tabs from '$lib/components/ui/tabs';

	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	let currentTab = writable<'table' | 'upload'>('table');

	setContext('currentTab', currentTab);

	let { data } = $props();
</script>

<Tabs.Root value={$currentTab} class="w-full">
	<Tabs.List class="grid w-full grid-cols-2 border-b bg-background">
		<Tabs.Trigger
			value="table"
			onclick={() => ($currentTab = 'table')}
			class="w-full px-4 py-1.5 text-center data-[state=active]:bg-muted"
		>
			Images List
		</Tabs.Trigger>
		<Tabs.Trigger
			value="upload"
			class="w-full px-4 py-1.5 text-center data-[state=active]:bg-muted"
			onclick={() => ($currentTab = 'upload')}
		>
			Upload Images
		</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="table" class="mt-4">
		<DataTable data={data.images} {columns} />
	</Tabs.Content>
	<Tabs.Content value="upload" class="mt-4">
		<UploadImages />
	</Tabs.Content>
</Tabs.Root>
