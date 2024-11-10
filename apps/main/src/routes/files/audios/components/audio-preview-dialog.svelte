<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import Play from 'lucide-svelte/icons/play';
	import { activeCollection } from '$lib/stores';

	let { audio, title, uuid }: { audio: string; title: string; uuid: string } = $props();
	let newTitle = $state(title);
	let isEditing = $state(false);

	const audioSource = `data:audio/mp3;base64,${audio}`;
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<Button variant="ghost" size="icon" class="h-8 w-8">
			<Play class="h-4 w-4" />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>
				{#if isEditing}
					<form
						method="POST"
						action="?/updateAudioAction"
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
			<audio controls class="w-full">
				<source src={audioSource} type="audio/mp3" />
				Your browser does not support the audio element.
			</audio>
		</div>
		<Dialog.Footer>
			<form
				method="POST"
				action="?/deleteAudioAction"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							toast.success('Audio deleted successfully');
							update();
						} else {
							toast.error('Audio deletion failed');
						}
					};
				}}
				class="flex gap-2"
			>
				<input type="hidden" name="collectionName" value={$activeCollection?.name} />
				<input type="hidden" name="uuid" value={uuid} />
				<Button
					variant="outline"
					onclick={() => {
						const link = document.createElement('a');
						link.href = audioSource;
						link.download = `${title}.mp3`;
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
