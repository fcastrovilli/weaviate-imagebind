<script lang="ts">
	import Controls from '$lib/components/visualization/Controls.svelte';
	import Graph from '$lib/components/visualization/Graph.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Settings } from 'lucide-svelte';
	import { GRAPH_DEFAULTS } from '$lib/utils/visualization';

	let { data } = $props();
	let params = $state(GRAPH_DEFAULTS.initialParams);
	let controlsOpen = $state(false);
</script>

<div class="relative flex h-full w-full flex-col">
	<div class="absolute right-4 top-4 z-10">
		<Button variant="outline" size="icon" onclick={() => (controlsOpen = !controlsOpen)}>
			<Settings class="h-4 w-4" />
		</Button>
	</div>
	<Controls bind:params bind:open={controlsOpen} />
	<Graph data={data.visualization!} bind:params />
</div>
