<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Library from 'lucide-svelte/icons/library';
	import type { CollectionConfig } from 'weaviate-client';
	import CreateCollection from '../weaviate/CreateCollection.svelte';
	import { page } from '$app/stores';
	import { activeCollection } from '$lib/stores';
	import { onMount } from 'svelte';

	let { collections = [] }: { collections: CollectionConfig[] } = $props();

	// Initialize from storage first
	onMount(() => {
		activeCollection.initializeFromStorage(collections);

		// Then check URL params
		const collectionName = $page.params.name;
		if (collectionName) {
			const collection = collections.find(
				(c) => c.name.toLowerCase() === collectionName.toLowerCase()
			);
			if (collection && (!$activeCollection || $activeCollection.name !== collection.name)) {
				activeCollection.set(collection);
			}
		}
	});

	let items = $derived([
		{
			title: 'Collections',
			url: '/collections',
			icon: Library,
			items:
				collections?.map((collection) => ({
					title: collection.name,
					url: `/collections/${collection.name.toLowerCase()}`,
					collection
				})) ?? []
		}
	]);

	// Function to check if a URL is active
	const isActive = (url: string, isMainItem = false) => {
		if (isMainItem) {
			return $page.url.pathname.startsWith(url);
		}
		return $page.url.pathname === url;
	};

	// Function to check if any child item is active
	const isGroupActive = (mainItem: (typeof items)[0]) => {
		return mainItem.items?.some((item) => isActive(item.url)) || isActive(mainItem.url, true);
	};

	// Handle collection selection
	const handleCollectionClick = (collection: CollectionConfig) => {
		activeCollection.set(collection);
	};
</script>

<Sidebar.Menu>
	{#if items?.length}
		{#each items as mainItem (mainItem.title)}
			<Collapsible.Root class="group/collapsible" open={isGroupActive(mainItem)}>
				{#snippet child({ props })}
					<Sidebar.MenuItem {...props}>
						<Collapsible.Trigger>
							{#snippet child({ props })}
								<Sidebar.MenuButton {...props} isActive={isActive(mainItem.url, true)}>
									{#snippet tooltipContent()}
										{mainItem.title}
									{/snippet}
									{#if mainItem.icon}
										<mainItem.icon />
									{/if}
									<a href={mainItem.url} class="flex-1">
										<span>{mainItem.title}</span>
									</a>
									<ChevronRight
										class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
									/>
								</Sidebar.MenuButton>
							{/snippet}
						</Collapsible.Trigger>
						<Collapsible.Content>
							{#if mainItem.items}
								<Sidebar.MenuSub>
									{#each mainItem.items as subItem (subItem.title)}
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton
												isActive={isActive(subItem.url)}
												onclick={() => handleCollectionClick(subItem.collection)}
											>
												{#snippet child({ props })}
													<a href={subItem.url} {...props}>
														<span>{subItem.title}</span>
													</a>
												{/snippet}
											</Sidebar.MenuSubButton>
										</Sidebar.MenuSubItem>
									{/each}
									<Sidebar.MenuItem>
										<CreateCollection />
									</Sidebar.MenuItem>
								</Sidebar.MenuSub>
							{/if}
						</Collapsible.Content>
					</Sidebar.MenuItem>
				{/snippet}
			</Collapsible.Root>
		{/each}
	{/if}
</Sidebar.Menu>
