<script lang="ts">
	import * as d3 from 'd3';
	import type { MediaObject, MediaType, GraphNode, GraphLink } from '$lib/types/visualization';

	import { onMount } from 'svelte';
	import type { WeaviateField } from 'weaviate-client';

	let { data } = $props();
	let svg: SVGSVGElement;

	function getMediaType(obj: MediaObject): MediaType {
		const props = obj.properties;
		if ('audioMetadata' in props) return 'audio';
		if ('imageMetadata' in props) return 'image';
		if ('videoMetadata' in props) return 'video';
		return 'text';
	}

	function getFieldValue(field: WeaviateField): string {
		if (field === null || field === undefined) return '';

		// Handle primitive types
		if (typeof field === 'string' || typeof field === 'number' || typeof field === 'boolean') {
			return String(field);
		}

		// Handle array types
		if (Array.isArray(field)) {
			return field.map(String).join(', ');
		}

		// Handle object types (like nested fields)
		if (typeof field === 'object') {
			// Try to get a string representation of the object
			try {
				const stringValue = JSON.stringify(field);
				return stringValue === '{}' ? '' : stringValue;
			} catch {
				return '';
			}
		}

		return '';
	}

	function createGraph() {
		if (!data?.visualization?.objects || !svg) return;

		const width = 800;
		const height = 600;
		const radius = 6;

		// Prepare nodes and links as before...
		const nodes: GraphNode[] = data.visualization.objects.map((obj) => {
			const titleField = obj.properties['title'];
			const label = titleField ? getFieldValue(titleField) : 'Untitled';

			return {
				id: obj.uuid,
				label,
				type: getMediaType(obj),
				weight: 0,
				x: width / 2 + Math.random() * 50,
				y: height / 2 + Math.random() * 50
			};
		});

		const nodeMap = new Map(nodes.map((node) => [node.id, node]));
		const links: GraphLink[] = data.visualization.relations
			.map((rel) => {
				const source = nodeMap.get(rel.source);
				const target = nodeMap.get(rel.target);
				if (!source || !target) return null;
				return { source, target, strength: 1 - rel.distance };
			})
			.filter((link): link is GraphLink => link !== null);

		// Setup SVG with zoom support
		const svg_container = d3
			.select<SVGSVGElement, unknown>(svg)
			.attr('viewBox', `0 0 ${width} ${height}`)
			.html('');

		// Create zoom behavior
		const zoom = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.2, 4]) // Set min/max zoom scale
			.on('zoom', (event) => {
				g.attr('transform', event.transform);
			});

		// Add zoom behavior to SVG
		svg_container.call(zoom);

		// Create main group for all elements
		const g = svg_container.append('g');

		// Add double-click to reset zoom
		svg_container.on('dblclick.zoom', () => {
			svg_container.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
		});

		// Draw links with enhanced styling
		const link = g
			.append('g')
			.attr('stroke', '#666')
			.attr('stroke-opacity', 0.6)
			.selectAll('line')
			.data(links)
			.join('line')
			.attr('stroke-width', (d) => Math.sqrt(d.strength) * 2);

		// Draw nodes with interaction
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

		// Add circles with hover effects
		node
			.append('circle')
			.attr('r', radius)
			.attr('fill', (d) => colors[d.type])
			.attr('stroke', '#fff')
			.attr('stroke-width', 1.5)
			.on('mouseover', function (event, d) {
				d3.select(this)
					.transition()
					.duration(200)
					.attr('r', radius * 1.5)
					.attr('stroke-width', 2);

				// Highlight connected nodes
				const connectedNodes = links
					.filter((l) => l.source.id === d.id || l.target.id === d.id)
					.flatMap((l) => [l.source.id, l.target.id]);

				node
					.selectAll('circle')
					.filter((n: any) => connectedNodes.includes(n.id))
					.transition()
					.duration(200)
					.attr('stroke', '#ffd700')
					.attr('stroke-width', 2);

				// Highlight connected links
				link
					.filter((l) => l.source.id === d.id || l.target.id === d.id)
					.transition()
					.duration(200)
					.attr('stroke', '#ffd700')
					.attr('stroke-width', (d) => Math.sqrt(d.strength) * 3);
			})
			.on('mouseout', function (event, d) {
				d3.select(this).transition().duration(200).attr('r', radius).attr('stroke-width', 1.5);

				// Reset highlights
				node
					.selectAll('circle')
					.transition()
					.duration(200)
					.attr('stroke', '#fff')
					.attr('stroke-width', 1.5);

				link
					.transition()
					.duration(200)
					.attr('stroke', '#666')
					.attr('stroke-width', (d) => Math.sqrt(d.strength) * 2);
			});

		// Add labels with better visibility
		node
			.append('text')
			.attr('x', radius + 4)
			.attr('y', '0.31em')
			.text((d) => d.label)
			.clone(true)
			.lower()
			.attr('fill', 'none')
			.attr('stroke', 'white')
			.attr('stroke-width', 3);

		// Optimized force simulation with adjusted parameters
		const simulation = d3
			.forceSimulation(nodes)
			.force(
				'link',
				d3
					.forceLink<GraphNode, GraphLink>(links)
					.id((d) => d.id)
					.distance((d) => 50 + 50 * (1 - d.strength)) // Reduced base distance
					.strength((d) => 0.5 + d.strength * 0.5) // Stronger links
			)
			.force(
				'charge',
				d3
					.forceManyBody()
					.strength(-300) // Reduced repulsion
					.distanceMax(200) // Limit repulsion range
			)
			.force(
				'center',
				d3.forceCenter(width / 2, height / 2).strength(0.3) // Added strength to center force
			)
			.force(
				'collision',
				d3
					.forceCollide()
					.radius(radius * 2)
					.strength(0.8) // Increased collision strength
			)
			// Add x and y forces to prevent extreme spreading
			.force('x', d3.forceX(width / 2).strength(0.05))
			.force('y', d3.forceY(height / 2).strength(0.05));

		// Initial positioning in a smaller area
		nodes.forEach((node, i) => {
			const angle = (i / nodes.length) * 2 * Math.PI;
			const radius = Math.min(width, height) / 4; // Smaller initial radius
			node.x = width / 2 + radius * Math.cos(angle);
			node.y = height / 2 + radius * Math.sin(angle);
		});

		// Adjust initial zoom to show all nodes
		const initialScale = 0.8;
		svg_container.call(
			zoom.transform,
			d3.zoomIdentity
				.translate(width / 2, height / 2)
				.scale(initialScale)
				.translate(-width / 2, -height / 2)
		);

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
	<div class="absolute bottom-4 right-4 rounded bg-background/80 p-2 text-sm backdrop-blur">
		<p>Mouse wheel to zoom</p>
		<p>Drag to pan</p>
		<p>Double-click to reset</p>
		<p>Hover nodes to highlight connections</p>
	</div>
	<svg
		bind:this={svg}
		class="h-full w-full rounded-lg border border-border bg-[#111]"
		style="min-height: 600px"
	/>
</div>
