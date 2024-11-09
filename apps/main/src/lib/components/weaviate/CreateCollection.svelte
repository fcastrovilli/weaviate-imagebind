<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { enhance } from '$app/forms';
	import Plus from 'lucide-svelte/icons/plus';
	import { toast } from 'svelte-sonner';
	let isOpen = $state(false);
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger class={buttonVariants({ variant: 'secondary', size: 'lg' })}>
		<div class="flex size-6 items-center justify-center rounded-md border bg-background">
			<Plus class="size-4" />
		</div>
		<div class="font-medium text-muted-foreground">Create collection</div>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<form
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						isOpen = false;
						toast.success(`Collection ${result.data?.name as string} created successfully`);
					}
					update();
				};
			}}
			method="POST"
			action="/collections?/createImageCollectionAction"
			class="flex flex-col gap-2"
		>
			<Dialog.Header>
				<Dialog.Title>Create Collection</Dialog.Title>
				<Dialog.Description>Start fresh with a new collection</Dialog.Description>
			</Dialog.Header>

			<div class="flex flex-col gap-2">
				<Label for="collectionName" class="text-right">Collection Name</Label>
				<Input
					id="collectionName"
					name="collectionName"
					placeholder="ImageCollection"
					class="col-span-3"
				/>
			</div>
			<Dialog.Footer>
				<Button type="submit">Create Collection</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
