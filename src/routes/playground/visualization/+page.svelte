<script lang="ts">
	import * as d3 from 'd3';
	import type { MediaObject, MediaType, GraphNode, GraphLink } from '$lib/types/visualization';
	import { onMount } from 'svelte';

	let { data } = $props();
	let svg: SVGSVGElement;

	function getMediaType(obj: MediaObject): MediaType {
		console.log('Object properties:', obj.properties);
		if (obj.properties['audioMetadata'] !== undefined && obj.properties['audioMetadata'] !== null) {
			return 'audio';
		}
		if (obj.properties['imageMetadata'] !== undefined && obj.properties['imageMetadata'] !== null) {
			return 'image';
		}
		if (obj.properties['videoMetadata'] !== undefined && obj.properties['videoMetadata'] !== null) {
			return 'video';
		}
		return 'text';
	}

	const colors: Record<MediaType, string> = {
		audio: '#FF4136', // Bright red
		image: '#7FDBFF', // Light blue
		video: '#01FF70', // Bright green
		text: '#FFDC00' // Yellow
	};

	function createGraph() {
		if (!data?.visualization?.objects || !svg) return;

		console.log(
			'Nodes and their types:',
			data.visualization.objects.map((obj) => ({
				title: obj.properties['title'],
				type: getMediaType(obj),
				metadata: {
					audio: obj.properties['audioMetadata'],
					image: obj.properties['imageMetadata'],
					video: obj.properties['videoMetadata']
				}
			}))
		);

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

		// Setup SVG
		const svg_container = d3.select(svg).attr('viewBox', `0 0 ${width} ${height}`).html('');

		// Add zoom
		const g = svg_container.append('g');
		svg_container.call(
			d3
				.zoom<SVGSVGElement, unknown>()
				.extent([
					[0, 0],
					[width, height]
				])
				.scaleExtent([0.2, 2])
				.on('zoom', (event) => g.attr('transform', event.transform))
		);

		// Draw links
		const link = g
			.append('g')
			.selectAll('line')
			.data(links)
			.join('line')
			.attr('stroke', '#999')
			.attr('stroke-width', 1);

		// Draw nodes
		const node = g
			.append('g')
			.selectAll('g')
			.data(nodes)
			.join('g')
			.call(
				d3
					.drag<any, GraphNode>()
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
					})
			);

		// Add circles
		node
			.append('circle')
			.attr('r', 8)
			.attr('fill', (d) => colors[d.type])
			.attr('stroke', '#fff')
			.attr('stroke-width', 1.5);

		// Add labels
		node
			.append('text')
			.text((d) => d.label)
			.attr('x', 10)
			.attr('y', 3)
			.attr('fill', '#fff')
			.style('font-size', '12px');

		// Force simulation
		const simulation = d3
			.forceSimulation<GraphNode>(nodes)
			.force(
				'link',
				d3
					.forceLink<GraphNode, GraphLink>(links)
					.id((d) => d.id)
					.distance(50)
					.strength(1)
			)
			.force('charge', d3.forceManyBody().strength(-200))
			.force('center', d3.forceCenter(width / 2, height / 2))
			.force('collision', d3.forceCollide().radius(20));

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

	onMount(() => createGraph());
</script>

<div class="relative h-full w-full">
	<svg
		bind:this={svg}
		class="h-full w-full rounded-lg border border-border bg-[#111]"
		style="min-height: 600px"
	/>
</div>
