<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let { image, title, uuid }: { image: string; title: string; uuid: string } = $props();

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
			<Dialog.Title>{title}</Dialog.Title>
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
				action="?/deleteImage"
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
