<script lang="ts">
	import { enhance } from '$app/forms';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import type { WeaviateNonGenericObject } from 'weaviate-client';

	let isLoading = $state(false);
	let uploadResult = $state<WeaviateNonGenericObject[] | undefined>(undefined);
	let queryType = $state<'hybrid' | 'bm25' | 'nearText' | 'nearImage'>('hybrid');
</script>

<div class="flex h-full flex-col">
	<!-- Top Navigation -->
	<div class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div class="container flex h-14 items-center">
			<ToggleGroup.Root type="single" bind:value={queryType} class="flex gap-2">
				<ToggleGroup.Item value="hybrid" class="rounded-md px-3 py-1 hover:bg-muted">
					Hybrid
				</ToggleGroup.Item>
				<ToggleGroup.Item value="bm25" class="rounded-md px-3 py-1 hover:bg-muted">
					BM25
				</ToggleGroup.Item>
				<ToggleGroup.Item value="nearText" class="rounded-md px-3 py-1 hover:bg-muted">
					Near Text
				</ToggleGroup.Item>
				<ToggleGroup.Item value="nearImage" class="rounded-md px-3 py-1 hover:bg-muted">
					Near Image
				</ToggleGroup.Item>
			</ToggleGroup.Root>
		</div>
	</div>

	<!-- Input Area -->
	<div class="border-t bg-background p-4">
		<div class="container mx-auto max-w-4xl">
			<form
				action="?/{queryType}"
				method="POST"
				enctype="multipart/form-data"
				class="relative flex items-center gap-2"
				use:enhance={() => {
					isLoading = true;
					return async ({ result }) => {
						if (result.type === 'success') {
							uploadResult = result.data?.result as WeaviateNonGenericObject[];
						}
						isLoading = false;
					};
				}}
			>
				{#if queryType === 'hybrid'}
					<Input
						type="text"
						name="query"
						placeholder="Enter your search query..."
						disabled={isLoading}
						class="flex-1"
					/>
					<Input
						type="file"
						name="file"
						accept="image/*,audio/*,video/*"
						disabled={isLoading}
						class="w-60"
					/>
				{:else if queryType === 'bm25' || queryType === 'nearText'}
					<Input
						type="text"
						name="query"
						placeholder="Enter your search query..."
						disabled={isLoading}
						class="flex-1"
					/>
					{#if queryType === 'bm25'}
						<Input
							type="text"
							name="properties"
							placeholder="Properties (comma-separated)"
							disabled={isLoading}
							class="w-60"
						/>
					{/if}
				{:else}
					<Input
						type="file"
						name="file"
						accept={queryType === 'nearImage' ? 'image/*' : 'image/*,audio/*,video/*'}
						disabled={isLoading}
						class="flex-1"
					/>
				{/if}

				<Button type="submit" disabled={isLoading}>
					{isLoading ? 'Searching...' : 'Search'}
				</Button>
			</form>
		</div>
	</div>

	<!-- Results Area -->
	<div class="max-w-screen-sm flex-1 overflow-clip p-4">
		{#if uploadResult}
			<div class="container mx-auto max-w-4xl space-y-4">
				<pre>{JSON.stringify(uploadResult, null, 2)}</pre>
			</div>
		{/if}
	</div>
</div>
