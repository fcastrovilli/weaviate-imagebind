<script lang="ts">
	import { onMount } from 'svelte';
	import { MediaQuery } from 'runed';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { page } from '$app/stores';

	// Add type for breadcrumb items
	type BreadcrumbItem = {
		href?: string;
		label: string;
	};

	// Function to capitalize first letter
	const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

	// Convert route segments into proper breadcrumb items
	let items: BreadcrumbItem[] = $state([]);
	const ITEMS_TO_DISPLAY = 3;

	onMount(() => {
		items = $page.url.pathname
			.split('/')
			.slice(1)
			.map((segment, index, array) => ({
				href: '/' + (index === 0 ? segment : array.slice(0, index + 1).join('/')),
				label: capitalize(segment || 'Home')
			}));
	});

	let open = $state(false);
	let isDesktop = $state(false);

	onMount(() => {
		const mediaQuery = new MediaQuery('(min-width: 768px)');
		isDesktop = mediaQuery.matches ?? false;
	});
</script>

<Breadcrumb.Root>
	<Breadcrumb.List>
		{#if items.length > ITEMS_TO_DISPLAY}
			<Breadcrumb.Item>
				{#snippet children()}
					<Breadcrumb.Link href="/">Home</Breadcrumb.Link>
				{/snippet}
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				{#snippet children()}
					{#if isDesktop}
						<DropdownMenu.Root bind:open>
							<DropdownMenu.Trigger class="flex items-center gap-1" aria-label="Toggle menu">
								{#snippet children()}
									<Breadcrumb.Ellipsis class="size-4" />
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="start">
								{#each items.slice(1, -2) as item}
									<DropdownMenu.Item>
										<a href={item.href ?? '#'}>{item.label}</a>
									</DropdownMenu.Item>
								{/each}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					{:else}
						<Drawer.Root bind:open>
							<Drawer.Trigger aria-label="Toggle Menu">
								{#snippet children()}
									<Breadcrumb.Ellipsis class="size-4" />
								{/snippet}
							</Drawer.Trigger>
							<Drawer.Content>
								<Drawer.Header class="text-left">
									<Drawer.Title>Navigate to</Drawer.Title>
									<Drawer.Description>Select a page to navigate to.</Drawer.Description>
								</Drawer.Header>
								<div class="grid gap-1 px-4">
									{#each items.slice(1, -2) as item}
										<a href={item.href ?? '#'} class="py-1 text-sm">
											{item.label}
										</a>
									{/each}
								</div>
								<Drawer.Footer class="pt-4">
									{#snippet children()}
										<Drawer.Close class={buttonVariants({ variant: 'outline' })}>Close</Drawer.Close
										>
									{/snippet}
								</Drawer.Footer>
							</Drawer.Content>
						</Drawer.Root>
					{/if}
				{/snippet}
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
		{/if}

		{#each items.slice(-ITEMS_TO_DISPLAY + 1) as item, i (i)}
			<Breadcrumb.Item>
				{#snippet children()}
					{#if item.href}
						<Breadcrumb.Link href={item.href} class="max-w-20 truncate md:max-w-none">
							{item.label}
						</Breadcrumb.Link>
						{#if i !== items.length - 1}
							<Breadcrumb.Separator />
						{/if}
					{:else}
						<Breadcrumb.Page class="max-w-20 truncate md:max-w-none">
							{item.label}
						</Breadcrumb.Page>
					{/if}
				{/snippet}
			</Breadcrumb.Item>
		{/each}
	</Breadcrumb.List>
</Breadcrumb.Root>
