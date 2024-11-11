<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { activeCollection } from '$lib/stores';

	let { image, title, uuid }: { image: string; title: string; uuid: string } = $props();
	let newTitle = $state(title);
	let isEditing = $state(false);

	const imageSource = `data:image/jpeg;base64,${image}`;
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<img
			src={imageSource}
			alt={title}
			class="h-12 w-12 cursor-pointer rounded object-cover transition-opacity hover:opacity-80"
		/>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[800px]">
		<Dialog.Header>
			<Dialog.Title>
				{#if isEditing}
					<form
						method="POST"
						action="?/updateImageAction"
						use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'success') {
									toast.success('Title updated successfully');
									isEditing = false;
									update();
								} else {
									toast.error('Failed to update title');
								}
							};
						}}
						class="flex gap-2"
					>
						<Input
							type="text"
							name="title"
							bind:value={newTitle}
							class="h-8"
							placeholder="Enter new title"
						/>
						<input type="hidden" name="uuid" value={uuid} />
						<input type="hidden" name="collectionName" value={$activeCollection?.name} />
						<Button type="submit" variant="outline" size="sm">Save</Button>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onclick={() => {
								isEditing = false;
								newTitle = title;
							}}>Cancel</Button
						>
					</form>
				{:else}
					<div class="flex items-center gap-2">
						<span>{title}</span>
						<Button
							variant="ghost"
							size="sm"
							onclick={() => {
								isEditing = true;
							}}>Edit</Button
						>
					</div>
				{/if}
			</Dialog.Title>
		</Dialog.Header>
		<div class="mt-4">
			<img
				src={imageSource}
				alt={title}
				class="h-auto max-h-[600px] w-full rounded-lg object-contain"
			/>
		</div>
		<Dialog.Footer>
			<form
				method="POST"
				action="?/deleteImageAction"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							toast.success('Image deleted successfully');
							update();
						} else {
							toast.error('Image deletion failed');
						}
					};
				}}
				class="flex gap-2"
			>
				<input type="hidden" name="uuid" value={uuid} />
				<Button
					variant="outline"
					onclick={() => {
						const link = document.createElement('a');
						link.href = imageSource;
						link.download = `${title}.jpg`;
						link.click();
					}}
				>
					Download
				</Button>
				<Button type="submit" variant="destructive">Delete</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
