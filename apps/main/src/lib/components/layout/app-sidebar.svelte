<script lang="ts">
	import { site_data as data } from './constants';
	import AudioWaveform from 'lucide-svelte/icons/audio-waveform';
	import NavMain from './nav-main.svelte';
	import NavProjects from './nav-projects.svelte';
	import NavUser from './nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import CollectionSwitcher from './collection-switcher.svelte';
	import type { CollectionConfig } from 'weaviate-client';

	let {
		ref = $bindable(null),
		collapsible = 'icon',
		collections,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { collections: CollectionConfig[] } = $props();
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
	<Sidebar.Header>
		<Sidebar.MenuButton
			size="lg"
			class="data-[state=open]:bg-sidebar data-[state=open]:text-sidebar-foreground"
		>
			<a href="/" class="flex items-center gap-2">
				<div
					class="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground"
				>
					<AudioWaveform class="size-6" />
				</div>
				<div class="grid flex-1 text-left text-sm leading-tight">
					<span class="truncate font-semibold"> CWAVASAPE </span>
				</div>
			</a>
		</Sidebar.MenuButton>
		<CollectionSwitcher {collections} />
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		<NavProjects projects={data.projects} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
