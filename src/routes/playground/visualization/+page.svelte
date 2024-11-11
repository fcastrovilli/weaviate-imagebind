<script lang="ts">
	import Controls from '$lib/components/visualization/Controls.svelte';
	import Graph from '$lib/components/visualization/Graph.svelte';
	import { GRAPH_DEFAULTS } from '$lib/utils/visualization';

	let { data } = $props();
	let params = $state(GRAPH_DEFAULTS.initialParams);
</script>

<div class="relative flex h-full w-full flex-col gap-4">
	<Controls bind:params />
	<Graph data={data.visualization!} bind:params />
</div>
