<script lang="ts">
	import * as d3 from 'd3';
	import type { MediaObject, MediaType, GraphNode, GraphLink } from '$lib/types/visualization';
	import { onMount } from 'svelte';

	let { data } = $props();
	let svg: SVGSVGElement;

	function getMediaType(obj: MediaObject): MediaType {
		const props = obj.properties;
		if ('audioMetadata' in props) return 'audio';
		if ('imageMetadata' in props) return 'image';
		if ('videoMetadata' in props) return 'video';
		return 'text';
	}

	function createGraph() {
		if (!data?.visualization?.objects || !svg) return;

		// Log data for debugging
		console.log('Objects:', data.visualization.objects);
		console.log('Relations:', data.visualization.relations);

		const width = 800;
		const height = 600;

		// Create nodes
		const nodes: GraphNode[] = data.visualization.objects.map((obj) => ({
			id: obj.uuid,
			label: String(obj.properties['title'] ?? ''),
			type: getMediaType(obj),
			weight: 0
		}));

		// Create links
		const nodeMap = new Map(nodes.map((node) => [node.id, node]));
		const links: GraphLink[] = data.visualization.relations
			.map((rel) => {
				const source = nodeMap.get(rel.source);
				const target = nodeMap.get(rel.target);
				if (!source || !target) return null;
				return { source, target, strength: 1 - rel.distance };
			})
			.filter((link): link is GraphLink => link !== null);

		// Basic SVG setup
		const svg_container = d3.select(svg).attr('viewBox', `0 0 ${width} ${height}`).html('');

		// Create container group for zooming
		const g = svg_container.append('g');

		// Add zoom behavior to SVG
		svg_container.call(
			d3
				.zoom<SVGSVGElement, unknown>()
				.extent([
					[0, 0],
					[width, height]
				])
				.scaleExtent([0.1, 4])
				.on('zoom', (event) => {
					g.attr('transform', event.transform);
				})
		);

		// Draw links
		const link = g
			.append('g')
			.selectAll('line')
			.data(links)
			.join('line')
			.attr('stroke', '#666')
			.attr('stroke-width', (d) => d.strength * 2);

		// Draw nodes
		const node = g.append('g').selectAll('g').data(nodes).join('g');

		// Add circles
		node
			.append('circle')
			.attr('r', 6)
			.attr('fill', (d) => colors[d.type])
			.attr('stroke', '#fff');

		// Add labels
		node
			.append('text')
			.attr('x', 8)
			.attr('y', 4)
			.text((d) => d.label)
			.attr('fill', '#fff');

		// Simple force simulation
		const simulation = d3
			.forceSimulation(nodes)
			.force(
				'link',
				d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id)
			)
			.force('charge', d3.forceManyBody().strength(-200))
			.force('center', d3.forceCenter(width / 2, height / 2));

		// Update positions
		simulation.on('tick', () => {
			link
				.attr('x1', (d) => d.source.x!)
				.attr('y1', (d) => d.source.y!)
				.attr('x2', (d) => d.target.x!)
				.attr('y2', (d) => d.target.y!);

			node.attr('transform', (d) => `translate(${d.x},${d.y})`);
		});
	}

	const colors: Record<MediaType, string> = {
		audio: '#ff7675',
		image: '#74b9ff',
		video: '#55efc4',
		text: '#ffeaa7'
	};

	onMount(() => createGraph());
</script>

<div class="relative h-full w-full">
	<svg
		bind:this={svg}
		class="h-full w-full rounded-lg border border-border bg-[#111]"
		style="min-height: 600px"
	/>
</div>
