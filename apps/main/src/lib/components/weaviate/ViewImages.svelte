<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import type { WeaviateNonGenericObject } from 'weaviate-client';

	let {
		images = $bindable(null),
		title = 'All Images'
	}: { images: WeaviateNonGenericObject[] | null; title?: string } = $props();
</script>

<Accordion.Root type="multiple">
	<Accordion.Item value="all-images">
		<Accordion.Trigger>
			<h2 class="text-2xl font-bold">{title}</h2>
		</Accordion.Trigger>
		<Accordion.Content>
			{#if images}
				{#each images as image}
					<Accordion.Item value={image.uuid}>
						<Accordion.Trigger>{image.properties.title}</Accordion.Trigger>
						<Accordion.Content>
							<pre>
							{JSON.stringify(image, null, 2)}
						</pre>
						</Accordion.Content>
					</Accordion.Item>
				{/each}
			{:else}
				<p>No images found</p>
			{/if}
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
