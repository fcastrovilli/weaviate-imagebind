<script lang="ts">
	import * as d3 from 'd3';
	import type {
		NetworkData,
		NetworkNode,
		NetworkLink,
		WeaviateObject,
		MediaType
	} from '$lib/types/visualization';
	import type { ZoomBehavior } from 'd3';

	let { data } = $props<{ files: WeaviateObject[] | null }>();
	let files = $state(data?.files ?? []);
	let svg: SVGSVGElement;
	let zoomLevel = $state(1);
	let zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> | null = null;

	function getNodeType(file: WeaviateObject): MediaType {
		if (file.properties.audioMetadata) return 'audio';
		if (file.properties.imageMetadata) return 'image';
		if (file.properties.videoMetadata) return 'video';
		if (file.properties.text) return 'text';
		return 'text'; // fallback to text
	}

	function getNodeColor(type: MediaType): string {
		switch (type) {
			case 'audio':
				return '#ff7675'; // red
			case 'image':
				return '#74b9ff'; // blue
			case 'video':
				return '#55efc4'; // green
			case 'text':
				return '#ffeaa7'; // yellow
			default:
				return '#b2bec3'; // gray
		}
	}

	function getNodeIcon(type: MediaType): string {
		switch (type) {
			case 'audio':
				return '🔊';
			case 'image':
				return '🖼️';
			case 'video':
				return '🎥';
			case 'text':
				return '📄';
			default:
				return '❓';
		}
	}

	function transformDataToNetwork(files: WeaviateObject[]): NetworkData {
		const nodes: NetworkNode[] = files.map((file) => ({
			id: file.uuid,
			title: file.properties.title,
			type: getNodeType(file),
			uuid: file.uuid,
			x: undefined,
			y: undefined,
			fx: null,
			fy: null
		}));

		const links: NetworkLink[] = [];

		for (let i = 0; i < nodes.length; i++) {
			for (let j = i + 1; j < nodes.length; j++) {
				if (nodes[i].title === nodes[j].title) {
					links.push({
						source: nodes[i],
						target: nodes[j],
						value: 1
					});
				}
			}
		}

		return { nodes, links };
	}

	function initializeZoom(
		svg_d3: d3.Selection<SVGSVGElement, unknown, null, undefined>,
		g: d3.Selection<SVGGElement, unknown, null, undefined>
	) {
		const width = parseInt(svg_d3.attr('viewBox').split(' ')[2]);
		const height = parseInt(svg_d3.attr('viewBox').split(' ')[3]);

		// Initialize zoom behavior
		zoomBehavior = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.1, 4])
			.on('zoom', (event) => {
				g.attr('transform', event.transform);
				zoomLevel = event.transform.k;
			});

		// Get the bounds of the graph content
		function getBBox() {
			const bbox = g.node()?.getBBox() ?? { x: 0, y: 0, width, height };
			return {
				x: bbox.x,
				y: bbox.y,
				width: bbox.width,
				height: bbox.height
			};
		}

		// Function to center and fit content
		function centerAndFit(scale = 1) {
			if (!zoomBehavior) return;

			const bounds = getBBox();
			const fullWidth = width;
			const fullHeight = height;
			const padding = 40; // Padding around the content

			// Calculate the scale that would fit the content
			const fitScale = Math.min(
				(fullWidth - padding * 2) / bounds.width,
				(fullHeight - padding * 2) / bounds.height
			);

			// Use the provided scale, but don't exceed the fit scale
			const finalScale = Math.min(scale, fitScale);

			// Calculate center point
			const centerX = bounds.x + bounds.width / 2;
			const centerY = bounds.y + bounds.height / 2;

			// Calculate the transform
			const transform = d3.zoomIdentity
				.translate(fullWidth / 2, fullHeight / 2)
				.scale(finalScale)
				.translate(-centerX, -centerY);

			// Apply the transform with transition
			svg_d3.transition().duration(750).call(zoomBehavior.transform, transform);
		}

		// Apply zoom behavior to SVG
		svg_d3.call(zoomBehavior);

		// Center the graph initially
		centerAndFit();

		// Add zoom controls to SVG
		const controls = svg_d3
			.append('g')
			.attr('class', 'zoom-controls')
			.attr('transform', 'translate(20, 20)');

		// Zoom in button
		controls
			.append('g')
			.attr('class', 'zoom-button')
			.attr('transform', 'translate(0, 0)')
			.call(createZoomButton, '+', () => handleZoom(1.2, centerAndFit))
			.append('title')
			.text('Zoom In');

		// Zoom out button
		controls
			.append('g')
			.attr('class', 'zoom-button')
			.attr('transform', 'translate(0, 40)')
			.call(createZoomButton, '-', () => handleZoom(0.8, centerAndFit))
			.append('title')
			.text('Zoom Out');

		// Reset/Center button
		controls
			.append('g')
			.attr('class', 'zoom-button')
			.attr('transform', 'translate(0, 80)')
			.call(createZoomButton, '⟲', () => centerAndFit(1))
			.append('title')
			.text('Reset View');

		// Style the zoom controls
		svg_d3
			.selectAll('.zoom-button')
			.style('cursor', 'pointer')
			.on('mouseenter', function () {
				d3.select(this).select('rect').style('fill', '#2a2a2a');
			})
			.on('mouseleave', function () {
				d3.select(this).select('rect').style('fill', '#1a1a1a');
			});
	}

	function createZoomButton(
		selection: d3.Selection<SVGGElement, unknown, null, undefined>,
		text: string,
		onClick: () => void
	) {
		// Button background
		selection
			.append('rect')
			.attr('width', 30)
			.attr('height', 30)
			.attr('rx', 6)
			.style('fill', '#1a1a1a')
			.style('stroke', '#333')
			.style('stroke-width', 1);

		// Button text
		selection
			.append('text')
			.attr('x', 15)
			.attr('y', 15)
			.attr('dy', '0.35em')
			.attr('text-anchor', 'middle')
			.style('fill', 'white')
			.style('font-size', '18px')
			.style('user-select', 'none')
			.text(text);

		// Add click handler
		selection.on('click', onClick);

		return selection;
	}

	function handleZoom(factor: number, centerCallback: (scale: number) => void) {
		if (!zoomBehavior) return;

		const svg_d3 = d3.select(svg);
		const transform = d3.zoomTransform(svg_d3.node() as Element);
		const newScale = transform.k * factor;

		if (newScale >= 0.1 && newScale <= 4) {
			centerCallback(newScale);
		}
	}

	function createNetworkGraph() {
		const width = 800;
		const height = 600;
		const networkData = transformDataToNetwork(files);

		// Clear existing SVG content
		d3.select(svg).selectAll('*').remove();

		const svg_d3 = d3.select<SVGSVGElement, unknown>(svg).attr('viewBox', `0 0 ${width} ${height}`);

		// Create a group for the zoomable content
		const g = svg_d3.append<SVGGElement>('g');

		// Initialize zoom
		initializeZoom(svg_d3, g);

		const simulation = d3
			.forceSimulation<NetworkNode>(networkData.nodes)
			.force(
				'link',
				d3.forceLink<NetworkNode, NetworkLink>(networkData.links).id((d) => d.id)
			)
			.force('charge', d3.forceManyBody().strength(-400))
			.force('center', d3.forceCenter(width / 2, height / 2));

		const links = g
			.append('g')
			.selectAll<SVGLineElement, NetworkLink>('line')
			.data(networkData.links)
			.join('line')
			.style('stroke', '#999')
			.style('stroke-opacity', 0.6)
			.style('stroke-width', 2);

		const nodeGroups = g
			.append('g')
			.selectAll<SVGGElement, NetworkNode>('g')
			.data(networkData.nodes)
			.join('g')
			.call(
				d3
					.drag<SVGGElement, NetworkNode>()
					.on('start', dragstarted)
					.on('drag', dragged)
					.on('end', dragended)
			);

		// Create circular background
		nodeGroups
			.append('circle')
			.attr('r', 24)
			.style('fill', (d) => getNodeColor(d.type))
			.style('stroke', '#2d3436')
			.style('stroke-width', 2);

		// Add icon text
		nodeGroups
			.append('text')
			.attr('class', 'icon')
			.text((d) => getNodeIcon(d.type))
			.attr('x', 0)
			.attr('y', 0)
			.attr('dy', '0.35em')
			.attr('text-anchor', 'middle')
			.style('font-size', '16px')
			.style('user-select', 'none');

		// Add title text
		nodeGroups
			.append('text')
			.text((d) => d.title)
			.attr('x', 0)
			.attr('y', 36)
			.attr('text-anchor', 'middle')
			.style('fill', 'white')
			.style('font-size', '14px')
			.style('font-weight', '500')
			.style('text-shadow', '0 1px 2px rgba(0,0,0,0.5)');

		// Update simulation tick function
		simulation.on('tick', () => {
			links
				.attr('x1', (d) => d.source.x ?? 0)
				.attr('y1', (d) => d.source.y ?? 0)
				.attr('x2', (d) => d.target.x ?? 0)
				.attr('y2', (d) => d.target.y ?? 0);

			nodeGroups.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
		});

		function dragstarted(event: d3.D3DragEvent<SVGGElement, NetworkNode, NetworkNode>) {
			if (!event.active) simulation.alphaTarget(0.3).restart();
			event.subject.fx = event.subject.x;
			event.subject.fy = event.subject.y;
		}

		function dragged(event: d3.D3DragEvent<SVGGElement, NetworkNode, NetworkNode>) {
			event.subject.fx = event.x;
			event.subject.fy = event.y;
		}

		function dragended(event: d3.D3DragEvent<SVGGElement, NetworkNode, NetworkNode>) {
			if (!event.active) simulation.alphaTarget(0);
			event.subject.fx = null;
			event.subject.fy = null;
		}
	}

	// Remove the window event listener and use the buttons instead
	$effect(() => {
		if (files && files.length > 0) {
			createNetworkGraph();
		}

		// Cleanup
		return () => {
			zoomBehavior = null;
		};
	});
</script>

<div class="relative flex h-full w-full flex-col items-center justify-center p-4">
	<svg
		bind:this={svg}
		class="h-full max-h-[600px] w-full max-w-4xl rounded-lg border border-border bg-background"
	/>
	<div
		class="absolute bottom-6 right-6 flex items-center gap-2 rounded-md bg-background/80 px-3 py-2 backdrop-blur"
	>
		<span class="text-sm font-medium text-foreground">Zoom: {(zoomLevel * 100).toFixed(0)}%</span>
	</div>
</div>
