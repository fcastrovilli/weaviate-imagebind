<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import CreateCollection from '$lib/components/weaviate/CreateCollection.svelte';

	let { data } = $props();
	let collections = $derived(data.collections);
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
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="text-2xl">{collection.name}</Card.Title>
						<Card.Description>{collection.description}</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="flex flex-col gap-1">
							<p class="text-sm font-medium">Properties</p>
							{#each collection.config.properties as property}
								<div class="flex flex-col gap-1 py-2 text-sm">
									<p>{property.name}</p>
									<p class="text-muted-foreground">{property.dataType}</p>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			</a>
		{/each}
	</div>
</div>
