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

	// Enhanced color palette with gradients
	function getGradientId(type: MediaType): string {
		return `gradient-${type}`;
	}

	function createGraph() {
		if (!data?.visualization?.objects || !svg) return;

		const objects = data.visualization.objects as MediaObject[];
		const width = 800;
		const height = 600;

		// Prepare nodes and links
		const nodes: GraphNode[] = objects.map((obj) => ({
			id: obj.uuid,
			label: obj.properties.title,
			type: getMediaType(obj),
			x: undefined,
			y: undefined,
			fx: null,
			fy: null,
			weight: 0
		}));

		const nodeMap = new Map(nodes.map((node) => [node.id, node]));
		const links: GraphLink[] = data.visualization.relations.map((relation) => {
			const source = nodeMap.get(relation.source)!;
			const target = nodeMap.get(relation.target)!;
			const strength = 1 - relation.distance;
			source.weight += strength;
			target.weight += strength;
			return { source, target, strength };
		});

		// Setup SVG
		const svgSelection = d3
			.select<SVGSVGElement, unknown>(svg)
			.attr('viewBox', `0 0 ${width} ${height}`)
			.html('');

		// Create gradients
		const defs = svgSelection.append('defs');

		// Define gradients for each type
		const gradients = {
			audio: { start: '#ff7675', end: '#d63031' },
			image: { start: '#74b9ff', end: '#0984e3' },
			video: { start: '#55efc4', end: '#00b894' },
			text: { start: '#ffeaa7', end: '#fdcb6e' }
		};

		Object.entries(gradients).forEach(([type, colors]) => {
			const gradient = defs
				.append('radialGradient')
				.attr('id', getGradientId(type as MediaType))
				.attr('cx', '50%')
				.attr('cy', '50%')
				.attr('r', '50%');

			gradient.append('stop').attr('offset', '0%').attr('stop-color', colors.start);
			gradient.append('stop').attr('offset', '100%').attr('stop-color', colors.end);
		});

		// Add zoom with smooth transitions
		const zoom = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.2, 2])
			.on('zoom', (event) => {
				container.attr('transform', event.transform);
			});

		svgSelection.call(zoom);
		const container = svgSelection.append('g');

		// Setup force simulation with adjusted forces
		const simulation = d3
			.forceSimulation<GraphNode>(nodes)
			.force(
				'link',
				d3
					.forceLink<GraphNode, GraphLink>(links)
					.id((d) => d.id)
					// Stronger pull for closer nodes
					.strength((d) => Math.pow(d.strength, 0.5) * 1.5)
					// Longer distance for weaker connections
					.distance((d) => 100 * (1 - d.strength))
			)
			// Stronger repulsion
			.force('charge', d3.forceManyBody().strength(-1000))
			.force('center', d3.forceCenter(width / 2, height / 2))
			// Adjusted collision radius based on node weight
			.force(
				'collision',
				d3.forceCollide<GraphNode>().radius((d) => 25 + d.weight * 10)
			);

		// Enhanced link styling with stronger visual feedback
		const link = container
			.append('g')
			.selectAll('line')
			.data(links)
			.join('line')
			.attr('stroke', '#2d3436')
			// More pronounced opacity difference
			.attr('stroke-opacity', (d) => 0.1 + d.strength * 0.9)
			// Exponential width scaling for stronger visual impact
			.attr('stroke-width', (d) => Math.pow(d.strength * 5, 1.5))
			// Add glow effect for strong connections
			.style('filter', (d) =>
				d.strength > 0.7 ? 'drop-shadow(0 0 3px rgba(255,255,255,0.3))' : 'none'
			);

		// Node styling with weight-based sizing
		const node = container.append('g').selectAll('g').data(nodes).join('g');

		// Add drag behavior
		node.call(
			d3
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
				}) as any
		);

		// Adjusted node circles with size based on weight
		node
			.append('circle')
			.attr('r', (d) => 20 + Math.sqrt(d.weight) * 5)
			.style('fill', (d) => `url(#${getGradientId(d.type)})`)
			.style('stroke', '#2d3436')
			.style('stroke-width', 2)
			.style('filter', 'drop-shadow(0 0 3px rgba(0,0,0,0.3))');

		// Adjusted label positioning based on node size
		node
			.append('text')
			.text((d) => d.label)
			.attr('text-anchor', 'middle')
			.attr('dy', (d) => 25 + Math.sqrt(d.weight) * 5)
			.attr('fill', 'white')
			.style('font-size', '12px')
			.style('font-weight', '500')
			.style('text-shadow', '0 1px 2px rgba(0,0,0,0.5)');

		// Enhanced hover effects
		node
			.on('mouseover', (event, d) => {
				hoveredNode = d;
				// Highlight connected nodes and links
				const connectedNodes = new Set(
					links
						.filter((l) => l.source.id === d.id || l.target.id === d.id)
						.flatMap((l) => [l.source.id, l.target.id])
				);

				node.style('opacity', (n) => (connectedNodes.has(n.id) || n.id === d.id ? 1 : 0.3));
				link
					.style('opacity', (l) => (l.source.id === d.id || l.target.id === d.id ? 1 : 0.1))
					.style('stroke-width', (l) => {
						if (l.source.id === d.id || l.target.id === d.id) {
							return Math.pow(l.strength * 6, 1.5);
						}
						return Math.pow(l.strength * 5, 1.5);
					});

				d3.select(event.currentTarget).style(
					'filter',
					'drop-shadow(0 0 6px rgba(255,255,255,0.3))'
				);
			})
			.on('mouseout', (event) => {
				hoveredNode = null;
				// Reset highlights
				node.style('opacity', 1);
				link.style('opacity', 1).style('stroke-width', (d) => Math.pow(d.strength * 5, 1.5));
				d3.select(event.currentTarget).style('filter', 'drop-shadow(0 0 3px rgba(0,0,0,0.3))');
			});

		// Update positions
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
		class="h-full max-h-[600px] w-full max-w-4xl rounded-lg border border-border bg-[#111]"
	/>
	{#if hoveredNode}
		<div
			class="absolute bottom-6 right-6 rounded-lg bg-background/90 p-4 shadow-lg backdrop-blur transition-all"
		>
			<h3 class="font-bold">{hoveredNode.label}</h3>
			<p class="text-sm opacity-80">Type: {hoveredNode.type}</p>
			<p class="text-sm opacity-80">Connections: {hoveredNode.weight.toFixed(2)}</p>
		</div>
	{/if}
</div>
