<script lang="ts">
	import { activeCollection } from '$lib/stores';
	import UploadAudios from './components/UploadAudios.svelte';
	import { columns } from './components/columns';
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
			onclick={() => ($currentTab = 'table')}
			value="table"
			class="w-full px-4 py-1.5 text-center data-[state=active]:bg-muted"
		>
			Audio Files List
		</Tabs.Trigger>
		<Tabs.Trigger
			onclick={() => ($currentTab = 'upload')}
			value="upload"
			class="w-full px-4 py-1.5 text-center data-[state=active]:bg-muted"
		>
			Upload Audio Files
		</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="table" class="mt-4">
		<DataTable data={data.audios} {columns} />
	</Tabs.Content>
	<Tabs.Content value="upload" class="mt-4">
		<UploadAudios />
	</Tabs.Content>
</Tabs.Root>
