<script lang="ts">
	import { site_data as data } from './constants';
	import AudioWaveform from 'lucide-svelte/icons/audio-waveform';
	import NavMain from './nav-main.svelte';
	import NavUser from './nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import CollectionSwitcher from './collection-switcher.svelte';
	import type { CollectionConfig } from 'weaviate-client';
	import NavPlayground from './nav-playground.svelte';

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
					<AudioWaveform class="size-6" />
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
