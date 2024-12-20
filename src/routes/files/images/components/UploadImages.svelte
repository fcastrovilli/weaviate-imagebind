<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import CloudUpload from 'lucide-svelte/icons/cloud-upload';
	import X from 'lucide-svelte/icons/x';
	import { toast } from 'svelte-sonner';
	import { onDestroy } from 'svelte';
	import { activeCollection } from '$lib/stores';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	let currentTab: Writable<'table' | 'upload'> = getContext('currentTab');

	let fileInput: HTMLInputElement;
	let isUploading = $state(false);
	let dragActive = $state(false);
	let files: FileList | null = $state(null);
	let previews = $state<{ name: string; url?: string; title: string }[]>([]);

	function handleDrag(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === 'dragenter' || e.type === 'dragover') {
			dragActive = true;
		} else if (e.type === 'dragleave') {
			dragActive = false;
		}
	}

	function updatePreviews(fileList: FileList) {
		const filesArray = Array.from(fileList).slice(0, 20);

		const dataTransfer = new DataTransfer();
		filesArray.forEach((file) => dataTransfer.items.add(file));
		files = dataTransfer.files;
		fileInput.files = dataTransfer.files;

		previews = filesArray.map((file) => ({
			name: file.name,
			url: URL.createObjectURL(file),
			title: file.name.replace(/\.[^/.]+$/, '')
		}));

		if (fileList.length > 20) {
			toast.error('Maximum 20 files allowed. Extra files were removed.');
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragActive = false;

		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			updatePreviews(e.dataTransfer.files);
		}
	}

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files) {
			updatePreviews(target.files);
		}
	}

	function removeFile(fileName: string) {
		if (!files) return;

		const fileArray = Array.from(files);
		const filteredFiles = fileArray.filter((file) => file.name !== fileName);

		const dataTransfer = new DataTransfer();
		filteredFiles.forEach((file) => dataTransfer.items.add(file));

		files = dataTransfer.files;
		fileInput.files = dataTransfer.files;

		const removedPreview = previews.find((p) => p.name === fileName);
		if (removedPreview?.url) {
			URL.revokeObjectURL(removedPreview.url);
		}
		previews = previews.filter((preview) => preview.name !== fileName);
	}

	function updateTitle(fileName: string, newTitle: string) {
		previews = previews.map((preview) =>
			preview.name === fileName ? { ...preview, title: newTitle } : preview
		);
	}

	// Cleanup URLs on component destruction
	onDestroy(() => {
		previews.forEach((preview) => {
			if (preview.url) URL.revokeObjectURL(preview.url);
		});
	});

	let fileCount = $state(0);
	$effect(() => {
		fileCount = files?.length ?? 0;
	});

	function clearFiles() {
		files = null;
		previews = [];
		if (fileInput) {
			fileInput.value = '';
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Upload Images</Card.Title>
		<Card.Description>Add images to your collection</Card.Description>
	</Card.Header>
	<Card.Content>
		<form
			method="post"
			use:enhance={() => {
				isUploading = true;
				return async ({ result, update }) => {
					if (result.type === 'success') {
						toast.success('Images uploaded successfully');
						isUploading = false;
						clearFiles();
						update();
						$currentTab = 'table';
					} else {
						toast.error('Images upload failed');
						isUploading = false;
					}
				};
			}}
			action="?/uploadImagesAction"
			enctype="multipart/form-data"
			class="flex flex-col gap-4"
		>
			<input type="hidden" name="collectionName" value={$activeCollection?.name} />
			<div
				role="button"
				tabindex={0}
				class="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center transition-colors"
				class:border-primary={dragActive || fileCount > 0}
				class:bg-muted={fileCount > 0}
				class:hover:bg-muted={true}
				class:opacity-50={isUploading}
				aria-disabled={isUploading}
				ondragenter={handleDrag}
				ondragover={handleDrag}
				ondragleave={handleDrag}
				ondrop={handleDrop}
			>
				<input
					bind:this={fileInput}
					id="imagefiles"
					type="file"
					name="imagefiles"
					accept="image/*"
					multiple
					class="absolute inset-0 cursor-pointer opacity-0"
					onchange={handleChange}
				/>
				<div class="flex flex-col items-center gap-2">
					<CloudUpload class="h-10 w-10 transition-colors" />
					<div class="flex flex-col gap-1">
						<p class="text-sm font-medium">
							{#if fileCount > 0}
								<span class="text-primary"
									>{fileCount} file{fileCount === 1 ? '' : 's'} selected</span
								>
							{:else}
								Drag & drop images here or click to select (max 20 files)
							{/if}
						</p>
						<p class="text-xs text-muted-foreground">Supported formats: PNG, JPG, GIF, WEBP</p>
					</div>
				</div>
			</div>

			{#if previews.length > 0}
				<div
					class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
					class:animate-pulse={isUploading}
				>
					{#each previews as preview}
						<div class="group relative rounded-md border bg-muted p-2">
							<button
								disabled={isUploading}
								type="button"
								class="absolute -right-2 -top-2 z-10 hidden rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90 group-hover:block"
								onclick={() => removeFile(preview.name)}
							>
								<X class="h-3 w-3" />
							</button>
							{#if preview.url}
								<img
									src={preview.url}
									alt={preview.name}
									class="mb-2 aspect-square w-full rounded object-cover"
								/>
							{/if}
							<div class="space-y-1.5">
								<p class="truncate text-[10px] text-muted-foreground" title={preview.name}>
									File: {preview.name}
								</p>
								<div class="space-y-1">
									<label for={`title-${preview.name}`} class="text-xs font-medium"> Title </label>
									<input
										id={`title-${preview.name}`}
										type="text"
										name="titles"
										value={preview.title}
										class="w-full rounded-sm border bg-transparent px-2 py-1 text-xs focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
										onchange={(e) =>
											updateTitle(preview.name, (e.target as HTMLInputElement).value)}
									/>
								</div>
							</div>
						</div>
					{/each}
				</div>
				<Button
					disabled={previews.length === 0 || isUploading}
					type="button"
					variant="outline"
					class="w-full"
					onclick={() => clearFiles()}
				>
					<X class="mr-2 h-4 w-4" />
					Clear Selection
				</Button>
			{/if}

			<Button
				type="submit"
				disabled={!files || files.length === 0 || isUploading || !$activeCollection}
				class="w-full"
			>
				{#if isUploading}
					<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				{isUploading ? 'Uploading...' : 'Upload'}
			</Button>
		</form>
	</Card.Content>
</Card.Root>
