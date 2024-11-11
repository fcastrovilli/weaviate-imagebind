<script lang="ts">
	import type { MediaObject, GraphNode, GraphLink, Relation } from '$lib/types/visualization';
	import {
		GRAPH_DEFAULTS,
		COLORS,
		createForceSimulation,
		initializeNodePositions,
		getMediaType
	} from '$lib/utils/visualization';
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	import MediaCard from './MediaCard.svelte';

	let {
		data,
		params = $bindable(GRAPH_DEFAULTS.initialParams)
	}: {
		data: { objects: MediaObject[]; relations: Relation[] };

		params: typeof GRAPH_DEFAULTS.initialParams;
	} = $props();

	let svg: SVGSVGElement;
	let currentSimulation: d3.Simulation<GraphNode, GraphLink> | null = null;
	let linkElements: d3.Selection<SVGLineElement, GraphLink, SVGGElement, unknown>;
	let nodeElements: d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown>;

	let hoveredNode: GraphNode | null = $state(null);
	let hoveredObject: MediaObject | null = $state(null);
	let mousePosition = $state({ x: 0, y: 0 });

	function initializeGraph() {
		if (!data?.objects || !svg) return;

		// Clear previous graph
		d3.select(svg).html('');

		// Setup SVG and zoom
		const svg_container = d3
			.select(svg)
			.attr('viewBox', `0 0 ${GRAPH_DEFAULTS.width} ${GRAPH_DEFAULTS.height}`);

		const g = svg_container.append('g');
		svg_container.call(
			d3
				.zoom<SVGSVGElement, unknown>()
				.extent([
					[0, 0],
					[GRAPH_DEFAULTS.width, GRAPH_DEFAULTS.height]
				])
				.scaleExtent([0.2, 2])
				.on('zoom', (event) => g.attr('transform', event.transform))
		);

		// Create initial nodes
		const nodes: GraphNode[] = data.objects.map((obj) => ({
			id: obj.uuid,
			label: String(obj.properties['title'] ?? ''),
			type: getMediaType(obj),
			weight: 0
		}));

		// Initialize node positions
		initializeNodePositions(nodes, GRAPH_DEFAULTS.width, GRAPH_DEFAULTS.height);

		// Store elements for later updates
		linkElements = g.append('g').selectAll('line');
		nodeElements = g.append('g').selectAll('g');

		// Create simulation
		currentSimulation = createForceSimulation(nodes, GRAPH_DEFAULTS.width, GRAPH_DEFAULTS.height);

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
		if (!currentSimulation || !data) return;

		// Filter relations based on threshold
		const filteredRelations = data.relations.filter(
			(rel) => rel.distance <= params.distanceThreshold
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
					.attr('r', GRAPH_DEFAULTS.nodeRadius)
					.attr('fill', (d) => COLORS[d.type])
					.attr('stroke', '#fff')
					.attr('stroke-width', 1.5)
					.on('mouseenter', (event, d) => handleNodeHover(event, d))
					.on('mouseleave', handleNodeLeave);
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
			.distance((d) => params.linkDistance * (1 + d.strength))
			.strength((d) => params.linkStrength * d.strength);

		currentSimulation
			.force('charge', d3.forceManyBody().strength(params.chargeStrength).distanceMax(300))
			.force(
				'center',
				d3
					.forceRadial(0, GRAPH_DEFAULTS.width / 2, GRAPH_DEFAULTS.height / 2)
					.strength(params.centerStrength)
			)
			.force('collision', d3.forceCollide().radius(20).strength(params.collisionStrength));

		// Gently reheat
		currentSimulation.alpha(0.3).restart();
	}

	function handleNodeHover(event: MouseEvent, node: GraphNode) {
		mousePosition = { x: event.clientX + 20, y: event.clientY + 20 };
		hoveredNode = node;
		hoveredObject = data.objects.find((obj) => obj.uuid === node.id) ?? null;
	}

	function handleNodeLeave() {
		hoveredNode = null;
		hoveredObject = null;
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

<div class="relative">
	<svg bind:this={svg} class="h-full w-full rounded-lg border border-border bg-[#111]" />

	{#if hoveredNode && hoveredObject}
		<MediaCard mediaObject={hoveredObject} position={mousePosition} type={hoveredNode.type} />
	{/if}
</div>
