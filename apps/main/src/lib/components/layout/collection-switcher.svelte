<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import Database from 'lucide-svelte/icons/database';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import type { CollectionConfig } from 'weaviate-client';
	import { activeCollection } from '$lib/stores';
	import CreateCollection from '../weaviate/CreateCollection.svelte';

	const sidebar = useSidebar();

	let { collections }: { collections: CollectionConfig[] } = $props();

	$activeCollection = collections[0];
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem class="data-[state=open]:bg-sidebar data-[state=open]:text-sidebar-foreground">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						{...props}
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<div
							class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
						>
							<Database class="size-4" />
						</div>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">
								{$activeCollection?.name || 'Select Collection'}
							</span>
							<small class="truncate text-[0.6rem] text-foreground/50">Change Collection</small>
						</div>
						<ChevronsUpDown class="ml-auto" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-[--bits-dropdown-menu-anchor-width] min-w-56 rounded-lg"
				align="start"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				sideOffset={4}
			>
				<DropdownMenu.Label class="text-xs text-muted-foreground">Collections</DropdownMenu.Label>
				{#each collections as collection, index (collection.name)}
					<DropdownMenu.Item onSelect={() => ($activeCollection = collection)} class="gap-2 p-2">
						<div class="flex size-6 items-center justify-center rounded-sm border">
							<Database class="size-4 shrink-0" />
						</div>
						{collection.name}
					</DropdownMenu.Item>
				{/each}
				<DropdownMenu.Separator />
				<DropdownMenu.Item class="gap-2 p-2">
					<CreateCollection />
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
