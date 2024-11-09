<script lang="ts">
	import { page } from '$app/stores';
	import { activeCollection } from '$lib/stores';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import Database from 'lucide-svelte/icons/database';
	import UploadImages from '$lib/components/weaviate/UploadImages.svelte';
	import ViewImages from '$lib/components/weaviate/ViewImages.svelte';
	import CompareImages from '$lib/components/weaviate/CompareImages.svelte';

	$: collection = $activeCollection;
	$: collectionName = $page.params.name;

	// const handleDeleteCollection = async () => {
	// 	if (!confirm('Are you sure you want to delete this collection?')) return;

	// 	try {
	// 		await deleteCollection(collectionName);
	// 		goto('/');
	// 	} catch (error) {
	// 		console.error('Failed to delete collection:', error);
	// 	}
	// };
</script>

<div class="container mx-auto p-6">
	<header class="mb-8">
		<div class="flex items-center gap-4">
			<div class="flex size-12 items-center justify-center rounded-lg bg-primary/10">
				<Database class="size-6 text-primary" />
			</div>
			<div>
				<h1 class="text-2xl font-bold">{collectionName}</h1>
				<p class="text-sm text-muted-foreground">Manage your collection settings and content</p>
			</div>
		</div>
	</header>

	<Tabs.Root value="overview" class="space-y-4">
		<Tabs.List>
			<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
			<Tabs.Trigger value="upload">Upload</Tabs.Trigger>
			<Tabs.Trigger value="search">Search</Tabs.Trigger>
			<Tabs.Trigger value="compare">Compare</Tabs.Trigger>
			<Tabs.Trigger value="settings">Settings</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="overview" class="space-y-4">
			<Card.Root>
				<Card.Header>
					<Card.Title>Collection Details</Card.Title>
					<Card.Description>Overview of your collection configuration</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="grid gap-4">
						<div class="grid grid-cols-[100px_1fr] gap-2">
							<div class="font-medium">Name</div>
							<div>{collection?.name}</div>
						</div>
						<div class="grid grid-cols-[100px_1fr] gap-2">
							<div class="font-medium">Vectorizer</div>
							<div>
								<pre>
                                             {JSON.stringify(collection?.vectorizers, null, 2)}
                                        </pre>
							</div>
						</div>
						<div class="grid grid-cols-[100px_1fr] gap-2">
							<div class="font-medium">Properties</div>
							<div>
								{#if collection?.properties}
									<ul class="list-inside list-disc">
										{#each collection.properties as property}
											<li>{property.name} ({property.dataType})</li>
										{/each}
									</ul>
								{/if}
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="upload">
			<Card.Root>
				<Card.Header>
					<Card.Title>Upload Images</Card.Title>
					<Card.Description>Add new images to your collection</Card.Description>
				</Card.Header>
				<Card.Content>
					<UploadImages />
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="search">
			<Card.Root>
				<Card.Header>
					<Card.Title>Search Images</Card.Title>
					<Card.Description>Browse and search through your collection</Card.Description>
				</Card.Header>
				<Card.Content>
					<ViewImages images={[]} />
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="compare">
			<Card.Root>
				<Card.Header>
					<Card.Title>Compare Images</Card.Title>
					<Card.Description>Compare similarity between images</Card.Description>
				</Card.Header>
				<Card.Content>
					<CompareImages />
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="settings">
			<Card.Root>
				<Card.Header>
					<Card.Title>Settings</Card.Title>
					<Card.Description>Manage collection settings</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="space-y-4">
						<div class="rounded-lg border border-destructive/50 p-4">
							<h3 class="mb-2 font-semibold text-destructive">Danger Zone</h3>
							<p class="mb-4 text-sm text-muted-foreground">
								Once you delete a collection, there is no going back. Please be certain.
							</p>
							<button
								class="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
							>
								Delete Collection
							</button>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</div>
