<script lang="ts">
	import { activeCollection } from '$lib/stores';
	import UploadVideos from './components/UploadVideos.svelte';
	import { columns } from './components/columns.js';
	import DataTable from './components/data-table.svelte';
	import * as Tabs from '$lib/components/ui/tabs';

	let { data } = $props();
</script>

<Tabs.Root value="table" class="w-full">
	<Tabs.List class="grid w-full grid-cols-2 border-b bg-background">
		<Tabs.Trigger value="table" class="w-full px-4 py-1.5 text-center data-[state=active]:bg-muted">
			Video Files List
		</Tabs.Trigger>
		<Tabs.Trigger
			value="upload"
			class="w-full px-4 py-1.5 text-center data-[state=active]:bg-muted"
		>
			Upload Video Files
		</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="table" class="mt-4">
		<DataTable data={data.videos} {columns} />
	</Tabs.Content>
	<Tabs.Content value="upload" class="mt-4">
		<UploadVideos />
	</Tabs.Content>
</Tabs.Root>
