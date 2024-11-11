<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Folder from 'lucide-svelte/icons/folder';
	import NavCollections from './nav-collections.svelte';
	import type { CollectionConfig } from '$lib/stores';
	import { page } from '$app/stores';
	import { activeCollection } from '$lib/stores';

	let { collections }: { collections: CollectionConfig[] } = $props();
	let items: Array<{
		title: string;
		icon: any;
		url: string;
		items: Array<{ title: string; url: string }>;
	}> = $state([]);

	const mediaTypeToTitle: Record<'image' | 'audio' | 'video' | 'text', string> = {
		image: 'Images',
		audio: 'Audios',
		video: 'Videos',
		text: 'Texts'
	};

	function updateNavigationItems() {
		if (!$activeCollection?.config?.mediaTypes?.length) {
			items = [];
			return;
		}

		const subItems = $activeCollection.config.mediaTypes.map((type) => ({
			title: mediaTypeToTitle[type],
			url: `/files/${type}s`
		}));

		items = [
			{
				title: 'Files',
				icon: Folder,
				url: '/files',
				items: subItems
			}
		];
	}

	$effect(() => {
		if ($activeCollection) {
			updateNavigationItems();
		}
	});

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
						<Collapsible.Trigger disabled={!$activeCollection}>
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
