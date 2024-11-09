<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import CreateCollection from '$lib/components/weaviate/CreateCollection.svelte';

	let { data } = $props();
	let collections = $derived(data.collections);

	function getMediaTypeColor(type: string) {
		switch (type) {
			case 'audio':
				return 'bg-blue-500/10 text-blue-500';
			case 'image':
				return 'bg-green-500/10 text-green-500';
			case 'text':
				return 'bg-yellow-500/10 text-yellow-500';
			case 'video':
				return 'bg-purple-500/10 text-purple-500';
			default:
				return 'bg-gray-500/10 text-gray-500';
		}
	}

	function formatPropertyName(name: string) {
		return name
			.replace(/([A-Z])/g, ' $1') // Add space before capital letters
			.replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between border-b pb-4">
		<p class="text-sm text-muted-foreground">
			{collections.length} collection{collections.length === 1 ? '' : 's'} total
		</p>
		<CreateCollection />
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
		{#each collections as collection}
			<a
				href={`/collections/${collection.name.toLowerCase()}`}
				class="transition-transform duration-200 hover:-translate-y-1 hover:no-underline"
			>
				<Card.Root class="group h-full">
					<Card.Header>
						<Card.Title class="text-2xl">{collection.name}</Card.Title>
						<Card.Description>{collection.description}</Card.Description>
						<div class="flex flex-wrap gap-2 pt-2">
							{#each collection.config.mediaTypes as mediaType}
								<Badge variant="secondary" class={getMediaTypeColor(mediaType)}>
									{mediaType}
								</Badge>
							{/each}
						</div>
					</Card.Header>
					<Card.Content>
						<div class="flex flex-col gap-1">
							<p class="text-sm font-medium">Properties</p>
							<div class="grid grid-cols-2 gap-2">
								{#each collection.config.properties as property}
									{#if property && typeof property === 'object' && 'name' in property && 'dataType' in property}
										<div class="flex flex-col gap-1 rounded-lg border p-2 text-sm">
											<p class="font-medium">{formatPropertyName(property.name as string)}</p>
											<p class="text-xs capitalize text-muted-foreground">
												{property.dataType}
											</p>
										</div>
									{/if}
								{/each}
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</a>
		{/each}
	</div>

	{#if collections.length === 0}
		<div class="flex flex-col items-center justify-center gap-2 rounded-lg border p-8 text-center">
			<p class="text-lg font-medium">No collections found</p>
			<p class="text-sm text-muted-foreground">Create a new collection to get started</p>
		</div>
	{/if}
</div>
