<script lang="ts">
	import AppSidebar from '$lib/components/layout/app-sidebar.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';

	import '../app.css';

	let { children, data } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar collections={data.collections} />
	<Sidebar.Inset>
		<header
			class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
		>
			<div class="flex items-center gap-2 px-4">
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 h-4" />
				<!-- TODO: Breadcrumb -->
			</div>
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
			<Toaster />
			{@render children?.()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
