<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Library from 'lucide-svelte/icons/library';
	import type { CollectionConfig } from 'weaviate-client';
	import CreateCollection from '../weaviate/CreateCollection.svelte';

	let { collections = [] }: { collections: CollectionConfig[] } = $props();

	let items = $derived([
		{
			title: 'Collections',
			url: '/',
			icon: Library,
			items:
				collections?.map((collection) => ({
					title: collection.name,
					url: `/collections/${collection.name.toLowerCase()}`
				})) ?? []
		}
	]);
</script>

<Sidebar.Menu>
	{#if items?.length}
		{#each items as mainItem (mainItem.title)}
			<Collapsible.Root class="group/collapsible">
				{#snippet child({ props })}
					<Sidebar.MenuItem {...props}>
						<Collapsible.Trigger>
							{#snippet child({ props })}
								<Sidebar.MenuButton {...props}>
									{#snippet tooltipContent()}
										{mainItem.title}
									{/snippet}
									{#if mainItem.icon}
										<mainItem.icon />
									{/if}
									<span>{mainItem.title}</span>
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
											<Sidebar.MenuSubButton>
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
