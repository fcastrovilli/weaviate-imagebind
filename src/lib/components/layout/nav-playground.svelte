<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/context.svelte.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import Folder from 'lucide-svelte/icons/folder';
	import Forward from 'lucide-svelte/icons/forward';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import SquareTerminal from 'lucide-svelte/icons/square-terminal';
	import History from 'lucide-svelte/icons/history';
	import { page } from '$app/stores';

	const sidebar = useSidebar();

	const playgroundItems = [
		{ name: 'Inference', url: '/', icon: SquareTerminal },
		{ name: 'History', url: '/', icon: History }
	];

	// Function to check if a URL is active
	const isActive = (url: string) => {
		return $page.url.pathname === url;
	};
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
	<Sidebar.GroupLabel>Playground</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each playgroundItems as item (item.name)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton isActive={isActive(item.url)}>
					{#snippet child({ props })}
						<a href={item.url} {...props}>
							<item.icon />
							<span>{item.name}</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuAction showOnHover {...props}>
								<Ellipsis />
								<span class="sr-only">More</span>
							</Sidebar.MenuAction>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						class="w-48 rounded-lg"
						side={sidebar.isMobile ? 'bottom' : 'right'}
						align={sidebar.isMobile ? 'end' : 'start'}
					>
						<DropdownMenu.Item>
							<Folder class="text-muted-foreground" />
							<span>View Project</span>
						</DropdownMenu.Item>
						<DropdownMenu.Item>
							<Forward class="text-muted-foreground" />
							<span>Share Project</span>
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item>
							<Trash2 class="text-muted-foreground" />
							<span>Delete Project</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
