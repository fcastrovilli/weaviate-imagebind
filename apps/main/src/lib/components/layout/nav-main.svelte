<script lang="ts" module>
	export let items = [
		{
			title: 'Files',
			icon: Folder,
			url: '/files',
			items: [
				{
					title: 'Images',
					url: '/files/images'
				},
				{
					title: 'Audios',
					url: '/files/audios'
				},
				{
					title: 'Videos',
					url: '/files/videos'
				},
				{
					title: 'Texts',
					url: '/files/texts'
				}
			]
		}
	];
</script>

<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Folder from 'lucide-svelte/icons/folder';
	import NavCollections from './nav-collections.svelte';
	import type { CollectionConfig } from 'weaviate-client';
	import { page } from '$app/stores';

	let { collections }: { collections: CollectionConfig[] } = $props();

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

<Sidebar.Group>
	<Sidebar.GroupLabel>Settings</Sidebar.GroupLabel>
	<Sidebar.Menu>
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
								</Sidebar.MenuSub>
							{/if}
						</Collapsible.Content>
					</Sidebar.MenuItem>
				{/snippet}
			</Collapsible.Root>
		{/each}
	</Sidebar.Menu>
	<NavCollections {collections} />
</Sidebar.Group>
