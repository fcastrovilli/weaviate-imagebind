<script lang="ts">
	import * as d3 from 'd3';
	import type { MediaObject, MediaType, GraphNode, GraphLink } from '$lib/types/visualization';
	import { onMount } from 'svelte';

	let { data } = $props();
	let svg: SVGSVGElement;
	let hoveredNode: GraphNode | null = $state(null);

	function getMediaType(obj: MediaObject): MediaType {
		if (obj.properties.audioMetadata) return 'audio';
		if (obj.properties.imageMetadata) return 'image';
		if (obj.properties.videoMetadata) return 'video';
		return 'text';
	}

	function getColor(type: MediaType): string {
		const colors = {
			audio: '#ff7675',
			image: '#74b9ff',
			video: '#55efc4',
			text: '#ffeaa7'
		};
		return colors[type];
	}

	function createGraph() {
		if (!data?.visualization?.objects || !svg) return;

		const objects = data.visualization.objects as MediaObject[];
		const width = 800;
		const height = 600;

		const nodes: GraphNode[] = objects.map((obj) => ({
			id: obj.uuid,
			label: obj.properties.title,
			type: getMediaType(obj),
			x: undefined,
			y: undefined,
			fx: null,
			fy: null,
			weight: 0 // Initialize weight
		}));

		const nodeMap = new Map(nodes.map((node) => [node.id, node]));

		const links: GraphLink[] = objects.slice(1).map((obj) => {
			const source = nodeMap.get(objects[0].uuid)!;
			const target = nodeMap.get(obj.uuid)!;
			const distance = (obj.metadata as { distance: number })?.distance ?? 0;
			const strength = 1 - distance;

			// Update node weights
			source.weight += strength;
			target.weight += strength;

			return { source, target, strength };
		});

		// Scale node sizes based on their weights
		const sizeScale = d3
			.scaleLinear()
			.domain([0, d3.max(nodes, (d) => d.weight) ?? 1])
			.range([10, 30]);

		const svgSelection = d3
			.select<SVGSVGElement, unknown>(svg)
			.attr('viewBox', `0 0 ${width} ${height}`)
			.html('');

		// Add zoom behavior
		const zoom = d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
			container.attr('transform', event.transform);
		});

		svgSelection.call(zoom);

		const container = svgSelection.append('g');

		// Create arrow marker for directed links
		container
			.append('defs')
			.append('marker')
			.attr('id', 'arrow')
			.attr('viewBox', '0 -5 10 10')
			.attr('refX', 20)
			.attr('refY', 0)
			.attr('markerWidth', 6)
			.attr('markerHeight', 6)
			.attr('orient', 'auto')
			.append('path')
			.attr('d', 'M0,-5L10,0L0,5')
			.attr('fill', '#999');

		const simulation = d3
			.forceSimulation<GraphNode>(nodes)
			.force(
				'link',
				d3
					.forceLink<GraphNode, GraphLink>(links)
					.id((d) => d.id)
					.strength((d) => d.strength)
			)
			.force('charge', d3.forceManyBody().strength(-500))
			.force('center', d3.forceCenter(width / 2, height / 2))
			.force(
				'collision',
				d3.forceCollide<GraphNode>().radius((d) => sizeScale(d.weight) + 10)
			);

		const link = container
			.append('g')
			.selectAll<SVGLineElement, GraphLink>('line')
			.data(links)
			.join('line')
			.attr('stroke', '#999')
			.attr('stroke-opacity', (d) => 0.2 + d.strength * 0.8)
			.attr('stroke-width', (d) => 1 + d.strength * 3)
			.attr('marker-end', 'url(#arrow)');

		const node = container.append('g').selectAll<SVGGElement, GraphNode>('g').data(nodes).join('g');

		// Apply drag behavior with proper typing
		const drag = d3
			.drag<SVGGElement, GraphNode>()
			.on('start', (event, d) => {
				if (!event.active) simulation.alphaTarget(0.3).restart();
				d.fx = event.x;
				d.fy = event.y;
			})
			.on('drag', (event, d) => {
				d.fx = event.x;
				d.fy = event.y;
			})
			.on('end', (event, d) => {
				if (!event.active) simulation.alphaTarget(0);
				d.fx = null;
				d.fy = null;
			});

		node
			.call(drag as any) // Type assertion needed for D3's drag behavior
			.on('mouseover', (_, d) => (hoveredNode = d))
			.on('mouseout', () => (hoveredNode = null));

		// Node circles with dynamic sizes
		node
			.append('circle')
			.attr('r', (d) => sizeScale(d.weight))
			.attr('fill', (d) => getColor(d.type))
			.attr('stroke', '#fff')
			.attr('stroke-width', 2);

		// Node labels
		node
			.append('text')
			.text((d) => d.label)
			.attr('text-anchor', 'middle')
			.attr('dy', (d) => sizeScale(d.weight) + 15)
			.attr('fill', '#fff')
			.attr('font-size', '12px')
			.attr('font-weight', 'bold');

		simulation.on('tick', () => {
			link
				.attr('x1', (d) => d.source.x ?? 0)
				.attr('y1', (d) => d.source.y ?? 0)
				.attr('x2', (d) => d.target.x ?? 0)
				.attr('y2', (d) => d.target.y ?? 0);

			node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
		});
	}

	onMount(() => {
		createGraph();
	});
</script>

<div class="relative flex h-full w-full flex-col items-center justify-center p-4">
	<svg
		bind:this={svg}
		class="h-full max-h-[600px] w-full max-w-4xl rounded-lg border border-border bg-background"
	/>
	{#if hoveredNode}
		<div class="absolute bottom-6 right-6 rounded-md bg-background/80 p-4 backdrop-blur">
			<h3 class="font-bold">{hoveredNode.label}</h3>
			<p class="text-sm">Type: {hoveredNode.type}</p>
			<p class="text-sm">Connections: {hoveredNode.weight.toFixed(2)}</p>
		</div>
	{/if}
</div>
