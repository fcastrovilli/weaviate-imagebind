<script lang="ts">
	import Folder from 'lucide-svelte/icons/folder';
	import { page } from '$app/stores';
	let { children } = $props();
</script>

<div class="container mx-auto p-6">
	<header class="mb-8">
		<div class="flex items-center gap-4">
			<div class="flex size-12 items-center justify-center rounded-lg bg-primary/10">
				<Folder class="size-6 text-primary" />
			</div>
			<div>
				<h1 class="text-2xl font-bold capitalize">
					{$page.url.pathname.split('/').slice(-1)[0] || 'Files'}
				</h1>
				<p class="text-sm text-muted-foreground">
					Manage your {$page.url.pathname.split('/').slice(-1)[0].toLowerCase() || 'files'}
				</p>
			</div>
		</div>
	</header>
	{@render children()}
</div>
