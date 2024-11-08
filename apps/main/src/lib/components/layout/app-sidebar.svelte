<script lang="ts" module>
	import { site_data as data } from './constants';
</script>

<script lang="ts">
	import AudioWaveform from 'lucide-svelte/icons/audio-waveform';
	import NavMain from './nav-main.svelte';
	import NavProjects from './nav-projects.svelte';
	import NavUser from './nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		collapsible = 'icon',
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
	<Sidebar.Header>
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
