<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import type { WeaviateNonGenericObject } from 'weaviate-client';

	let { images = $bindable(null) }: { images: WeaviateNonGenericObject[] | null } = $props();
</script>

{#if images}
	<div class="flex flex-wrap gap-4">
		{#each images as image (image.uuid)}
			<Card.Root class="h-min max-w-xs" id={image.uuid}>
				<Card.Header class="px-2 pt-2">
					<Card.Title>{image.properties.title}</Card.Title>
				</Card.Header>
				<Card.Content class="p-2">
					<img
						class="h-auto w-full rounded-lg"
						src={`data:image/jpeg;base64,${image.properties.image as string}`}
						alt={image.properties.title as string}
					/>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
{/if}
