<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import Play from 'lucide-svelte/icons/play';
	import { activeCollection } from '$lib/stores';

	let { audio, title, uuid }: { audio: string; title: string; uuid: string } = $props();

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
			<Dialog.Title>{title}</Dialog.Title>
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
				action="?/deleteAudio"
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
