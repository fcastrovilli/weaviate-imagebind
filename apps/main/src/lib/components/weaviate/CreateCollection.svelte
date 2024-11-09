<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { enhance } from '$app/forms';
	import Plus from 'lucide-svelte/icons/plus';
	import { toast } from 'svelte-sonner';

	let open = $state(false);
	let values = $state<string[]>([]);
	let name = $state('');

	// Format name as user types
	function handleNameInput(event: Event) {
		const input = event.target as HTMLInputElement;
		name = input.value
			.toLowerCase()
			.replace(/\s+/g, '')
			.replace(/[^a-z0-9]/g, '');
		input.value = name;
	}

	const mediaTypes = [
		{ value: 'audio', label: 'Audio' },
		{ value: 'image', label: 'Image' },
		{ value: 'text', label: 'Text' },
		{ value: 'video', label: 'Video' }
	] as const;

	const triggerContent = $derived(
		values.length === 0
			? 'Select media types...'
			: values
					.map((value) => mediaTypes.find((t) => t.value === value)?.label)
					.filter(Boolean)
					.join(', ')
	);
</script>

<Dialog.Root bind:open>
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
						open = false;
						toast.success('Collection created successfully');
					} else {
						toast.error('Failed to create collection');
					}
					update();
				};
			}}
			method="POST"
			action="?/createCollectionAction"
			class="flex flex-col gap-4"
		>
			<Dialog.Header>
				<Dialog.Title>Create Collection</Dialog.Title>
				<Dialog.Description>
					Create a new collection for storing and searching media content
				</Dialog.Description>
			</Dialog.Header>

			<div class="flex flex-col gap-2">
				<Label for="name">Collection Name</Label>
				<Input
					id="name"
					name="name"
					bind:value={name}
					oninput={handleNameInput}
					placeholder="mycollection"
					required
					pattern="[a-z0-9]+"
					title="Use only lowercase letters and numbers, no spaces"
				/>
				<span class="text-xs text-muted-foreground">
					Use only lowercase letters and numbers, no spaces. First letter will be capitalized
					automatically.
				</span>
			</div>

			<div class="flex flex-col gap-2">
				<Label for="description">Description (Optional)</Label>
				<Input id="description" name="description" placeholder="Collection description..." />
			</div>

			<div class="flex flex-col gap-2">
				<Label for="mediaType">Media Types</Label>
				<Select.Root type="multiple" bind:value={values}>
					<Select.Trigger class="w-full">
						{triggerContent}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.GroupHeading>Media Types</Select.GroupHeading>
							{#each mediaTypes as type}
								<Select.Item value={type.value}>{type.label}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
				{#each values as value}
					<input type="hidden" name="mediaTypes" {value} />
				{/each}
			</div>

			<Dialog.Footer>
				<Button type="submit" disabled={values.length === 0 || !name}>Create Collection</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
