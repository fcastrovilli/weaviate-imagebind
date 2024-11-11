<script lang="ts">
	import * as d3 from 'd3';
	import type { MediaObject, MediaType, GraphNode, GraphLink } from '$lib/types/visualization';
	import { onMount } from 'svelte';

	// Add width and height to outer scope
	const width = 800;
	const height = 600;

	let { data } = $props();
	let svg: SVGSVGElement;
	let distanceThreshold = $state(0.35); // Initial threshold value
	let linkDistance = $state(45);
	let linkStrength = $state(0.2);
	let chargeStrength = $state(-120);
	let centerStrength = $state(0.1);
	let collisionStrength = $state(0.35);

	// Keep track of the simulation
	let currentSimulation: d3.Simulation<GraphNode, GraphLink> | null = null;

	// Store references to graph elements
	let linkElements: d3.Selection<SVGLineElement, GraphLink, SVGGElement, unknown>;
	let nodeElements: d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown>;

	function getMediaType(obj: MediaObject): MediaType {
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

	function initializeGraph() {
		if (!data?.visualization?.objects || !svg) return;

		// Clear previous graph
		d3.select(svg).html('');

		// Setup SVG and zoom
		const svg_container = d3.select(svg).attr('viewBox', `0 0 ${width} ${height}`);

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

		// Create initial nodes and links
		const nodes: GraphNode[] = data.visualization.objects.map((obj) => ({
			id: obj.uuid,
			label: String(obj.properties['title'] ?? ''),
			type: getMediaType(obj),
			weight: 0
		}));

		// Initialize node positions
		nodes.forEach((node, i) => {
			const angle = (i / nodes.length) * 2 * Math.PI;
			const radius = Math.min(width, height) / 4;
			node.x = width / 2 + radius * Math.cos(angle);
			node.y = height / 2 + radius * Math.sin(angle);
		});

		// Store elements for later updates
		linkElements = g.append('g').selectAll('line');

		nodeElements = g.append('g').selectAll('g');

		// Create simulation
		currentSimulation = d3
			.forceSimulation<GraphNode>(nodes)
			.force(
				'link',
				d3.forceLink<GraphNode, GraphLink>().id((d) => d.id)
			)
			.force('charge', d3.forceManyBody())
			.force('center', d3.forceCenter(width / 2, height / 2))
			.force('collision', d3.forceCollide());

		// Set up tick handler
		currentSimulation.on('tick', () => {
			linkElements
				.attr('x1', (d) => d.source.x!)
				.attr('y1', (d) => d.source.y!)
				.attr('x2', (d) => d.target.x!)
				.attr('y2', (d) => d.target.y!);

			nodeElements.attr('transform', (d) => `translate(${d.x},${d.y})`);
		});

		// Initial update
		updateGraph();
	}

	function updateGraph() {
		if (!currentSimulation || !data?.visualization) return;

		// Filter relations based on threshold
		const filteredRelations = data.visualization.relations.filter(
			(rel) => rel.distance <= distanceThreshold
		);

		// Update links
		const nodeMap = new Map(currentSimulation.nodes().map((node) => [node.id, node]));
		const links: GraphLink[] = filteredRelations
			.map((rel) => {
				const source = nodeMap.get(rel.source);
				const target = nodeMap.get(rel.target);
				if (!source || !target) return null;
				return { source, target, strength: 1 - rel.distance };
			})
			.filter((link): link is GraphLink => link !== null);

		// Update visual elements
		linkElements = linkElements
			.data(links, (d: any) => d.source.id + '-' + d.target.id)
			.join('line')
			.attr('stroke', '#999')
			.attr('stroke-width', 1);

		nodeElements = nodeElements
			.data(currentSimulation.nodes(), (d) => d.id)
			.join((enter) => {
				const g = enter.append('g');
				g.append('circle')
					.attr('r', 8)
					.attr('fill', (d) => colors[d.type])
					.attr('stroke', '#fff')
					.attr('stroke-width', 1.5);
				g.append('text')
					.text((d) => d.label)
					.attr('x', 10)
					.attr('y', 3)
					.attr('fill', '#fff')
					.style('font-size', '12px');
				return g;
			})
			.call(
				d3
					.drag<any, GraphNode>()
					.on('start', (event, d) => {
						if (!event.active) currentSimulation?.alphaTarget(0.3).restart();
						d.fx = event.x;
						d.fy = event.y;
					})
					.on('drag', (event, d) => {
						d.fx = event.x;
						d.fy = event.y;
					})
					.on('end', (event, d) => {
						if (!event.active) currentSimulation?.alphaTarget(0);
						d.fx = null;
						d.fy = null;
					})
			);

		// Update force parameters
		const linkForce = currentSimulation.force('link') as d3.ForceLink<GraphNode, GraphLink>;
		linkForce
			.links(links)
			.distance((d) => linkDistance * (1 + d.strength))
			.strength((d) => linkStrength * d.strength);

		currentSimulation
			.force('charge', d3.forceManyBody().strength(chargeStrength).distanceMax(300))
			.force(
				'center',
				d3
					.forceRadial(
						0, // radius - 0 means towards center
						width / 2, // centerX
						height / 2 // centerY
					)
					.strength(centerStrength) // Now acts as gravitational pull
			)
			.force('collision', d3.forceCollide().radius(20).strength(collisionStrength));

		// Gently reheat
		currentSimulation.alpha(0.3).restart();
	}

	// Initialize graph once
	onMount(() => {
		initializeGraph();
	});

	// Update when parameters change
	$effect(() => {
		updateGraph();
	});
</script>

<div class="relative flex h-full w-full flex-col gap-4">
	<div class="grid grid-cols-2 gap-4 rounded-lg bg-background/50 p-4">
		<div class="flex items-center gap-4">
			<label for="threshold" class="w-48 text-sm font-medium">
				Distance Threshold: {distanceThreshold.toFixed(2)}
			</label>
			<input
				id="threshold"
				type="range"
				min="0"
				max="1"
				step="0.001"
				bind:value={distanceThreshold}
				class="w-48"
			/>
		</div>

		<div class="flex items-center gap-4">
			<label for="linkDistance" class="w-48 text-sm font-medium">
				Link Distance: {linkDistance}
			</label>
			<input
				id="linkDistance"
				type="range"
				min="20"
				max="300"
				step="5"
				bind:value={linkDistance}
				class="w-48"
			/>
		</div>

		<div class="flex items-center gap-4">
			<label for="linkStrength" class="w-48 text-sm font-medium">
				Link Strength: {linkStrength.toFixed(2)}
			</label>
			<input
				id="linkStrength"
				type="range"
				min="0"
				max="1"
				step="0.01"
				bind:value={linkStrength}
				class="w-48"
			/>
		</div>

		<div class="flex items-center gap-4">
			<label for="chargeStrength" class="w-48 text-sm font-medium">
				Charge Strength: {chargeStrength}
			</label>
			<input
				id="chargeStrength"
				type="range"
				min="-500"
				max="0"
				step="10"
				bind:value={chargeStrength}
				class="w-48"
			/>
		</div>

		<div class="flex items-center gap-4">
			<label for="centerStrength" class="w-48 text-sm font-medium">
				Center Strength: {centerStrength.toFixed(2)}
			</label>
			<input
				id="centerStrength"
				type="range"
				min="-0.1"
				max="0.8"
				step="0.01"
				bind:value={centerStrength}
				class="w-48"
			/>
		</div>

		<div class="flex items-center gap-4">
			<label for="collisionStrength" class="w-48 text-sm font-medium">
				Collision Strength: {collisionStrength.toFixed(2)}
			</label>
			<input
				id="collisionStrength"
				type="range"
				min="0"
				max="1"
				step="0.01"
				bind:value={collisionStrength}
				class="w-48"
			/>
		</div>
	</div>

	<svg
		bind:this={svg}
		class="h-full w-full rounded-lg border border-border bg-[#111]"
		style="min-height: 600px"
	/>
</div>
