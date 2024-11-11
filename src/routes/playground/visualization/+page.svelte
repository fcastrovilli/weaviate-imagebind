<script lang="ts">
	import * as d3 from 'd3';
	import type { MediaObject, MediaType, GraphNode, GraphLink } from '$lib/types/visualization';
	import { onMount } from 'svelte';

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

	function createGraph() {
		if (!data?.visualization?.objects || !svg) return;

		// Filter relations based on threshold
		const filteredRelations = data.visualization.relations.filter((rel) => {
			const isFiltered = rel.distance <= distanceThreshold;
			return isFiltered;
		});

		const width = 800;
		const height = 600;

		// Create nodes
		const nodes: GraphNode[] = data.visualization.objects.map((obj) => ({
			id: obj.uuid,
			label: String(obj.properties['title'] ?? ''),
			type: getMediaType(obj),
			weight: 0
		}));

		// Create links with filtered relations
		const nodeMap = new Map(nodes.map((node) => [node.id, node]));
		const links: GraphLink[] = filteredRelations
			.map((rel) => {
				const source = nodeMap.get(rel.source);
				const target = nodeMap.get(rel.target);
				if (!source || !target) return null;
				return { source, target, strength: 1 - rel.distance };
			})
			.filter((link): link is GraphLink => link !== null);

		// Clear previous graph
		d3.select(svg).html('');

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

		// If we have an existing simulation, stop it
		if (currentSimulation) {
			currentSimulation.stop();
		}

		// Create the simulation
		currentSimulation = d3
			.forceSimulation<GraphNode>(nodes)
			.force(
				'link',
				d3
					.forceLink<GraphNode, GraphLink>(links)
					.id((d) => d.id)
					.distance((d) => linkDistance * (1 + d.strength))
					.strength((d) => linkStrength * d.strength)
			)
			.force('charge', d3.forceManyBody().strength(chargeStrength).distanceMax(300).theta(0.9))
			.force('center', d3.forceCenter(width / 2, height / 2).strength(centerStrength))
			.force('collision', d3.forceCollide().radius(20).strength(collisionStrength).iterations(3));

		// Update force parameters without recreating the simulation
		$effect(() => {
			const linkForce = currentSimulation?.force('link') as d3.ForceLink<GraphNode, GraphLink>;
			if (linkForce) {
				linkForce
					.distance((d) => linkDistance * (1 + d.strength))
					.strength((d) => linkStrength * d.strength);
			}

			const chargeForce = currentSimulation?.force('charge') as d3.ForceManyBody<GraphNode>;
			if (chargeForce) {
				chargeForce.strength(chargeStrength);
			}

			const centerForce = currentSimulation?.force('center') as d3.ForceCenter<GraphNode>;
			if (centerForce) {
				centerForce.strength(centerStrength);
			}

			const collisionForce = currentSimulation?.force('collision') as d3.ForceCollide<GraphNode>;
			if (collisionForce) {
				collisionForce.strength(collisionStrength);
			}

			// Gently reheat the simulation
			currentSimulation?.alpha(0.3).restart();
		});

		// Initialize nodes in a more compact arrangement
		nodes.forEach((node, i) => {
			const angle = (i / nodes.length) * 2 * Math.PI;
			const radius = Math.min(width, height) / 4; // Smaller initial radius
			node.x = width / 2 + radius * Math.cos(angle);
			node.y = height / 2 + radius * Math.sin(angle);
		});

		// Update positions
		currentSimulation?.on('tick', () => {
			link
				.attr('x1', (d) => d.source.x!)
				.attr('y1', (d) => d.source.y!)
				.attr('x2', (d) => d.target.x!)
				.attr('y2', (d) => d.target.y!);

			node.attr('transform', (d) => `translate(${d.x},${d.y})`);
		});
	}

	// Only recreate graph when data or threshold changes
	$effect(() => {
		if (data?.visualization) {
			createGraph();
		}
	});

	onMount(() => createGraph());
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
				step="0.01"
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
				step="0.05"
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
				step="20"
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
				min="0"
				max="2"
				step="0.1"
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
				step="0.05"
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
