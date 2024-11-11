<script lang="ts">
	import { site_data as data } from './constants';
	import HeartCrack from 'lucide-svelte/icons/heart-crack';
	import NavMain from './nav-main.svelte';
	import NavUser from './nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import CollectionSwitcher from './collection-switcher.svelte';
	import type { CollectionConfig as WeaviateCollectionConfig } from 'weaviate-client';
	import type { CollectionConfig as AppCollectionConfig } from '$lib/stores';

	import NavPlayground from './nav-playground.svelte';

	type CollectionConfig = WeaviateCollectionConfig & {
		config: AppCollectionConfig['config'];
	};

	let {
		ref = $bindable(null),
		collapsible = 'icon',
		collections,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { collections: CollectionConfig[] } = $props();
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
	<Sidebar.Header>
		<a href="/" class="flex items-center gap-2">
			<Sidebar.MenuButton
				size="lg"
				class="data-[state=open]:bg-sidebar data-[state=open]:text-sidebar-foreground"
			>
				<div
					class="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground"
				>
					<HeartCrack class="size-6" />
				</div>
				<div class="grid flex-1 text-left text-sm leading-tight">
					<span class="truncate font-semibold"> CWAVASAPE </span>
				</div>
			</Sidebar.MenuButton>
		</a>
		<CollectionSwitcher {collections} />
	</Sidebar.Header>
	<Sidebar.Content>
		<NavPlayground />
		<NavMain {collections} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
