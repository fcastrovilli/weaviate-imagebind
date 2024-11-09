<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Library from 'lucide-svelte/icons/library';
	import type { CollectionConfig } from 'weaviate-client';
	import CreateCollection from '../weaviate/CreateCollection.svelte';
	import { page } from '$app/stores';

	let { collections = [] }: { collections: CollectionConfig[] } = $props();

	let items = $derived([
		{
			title: 'Collections',
			url: '/collections',
			icon: Library,
			items:
				collections?.map((collection) => ({
					title: collection.name,
					url: `/collections/${collection.name.toLowerCase()}`
				})) ?? []
		}
	]);

	// Function to check if a URL is active
	const isActive = (url: string, isMainItem = false) => {
		if (isMainItem) {
			// For main items, check if current path starts with the URL
			return $page.url.pathname.startsWith(url);
		}
		// For sub items, exact match
		return $page.url.pathname === url;
	};

	// Function to check if any child item is active
	const isGroupActive = (mainItem: (typeof items)[0]) => {
		return mainItem.items?.some((item) => isActive(item.url)) || isActive(mainItem.url, true);
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
											<Sidebar.MenuSubButton isActive={isActive(subItem.url)}>
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
