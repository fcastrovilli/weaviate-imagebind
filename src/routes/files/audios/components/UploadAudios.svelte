<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import Upload from 'lucide-svelte/icons/upload';
	import X from 'lucide-svelte/icons/x';
	import { toast } from 'svelte-sonner';
	import { activeCollection } from '$lib/stores';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	let currentTab: Writable<'table' | 'upload'> = getContext('currentTab');

	let fileInput: HTMLInputElement;
	let isUploading = $state(false);
	let dragActive = $state(false);
	let files: FileList | null = $state(null);
	let previews = $state<{ name: string; title: string }[]>([]);

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

		previews = previews.filter((preview) => preview.name !== fileName);
	}

	function updateTitle(fileName: string, newTitle: string) {
		previews = previews.map((preview) =>
			preview.name === fileName ? { ...preview, title: newTitle } : preview
		);
	}

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
		<Card.Title>Upload Audio Files</Card.Title>
		<Card.Description>Add audio files to your collection</Card.Description>
	</Card.Header>
	<Card.Content>
		<form
			method="post"
			use:enhance={() => {
				isUploading = true;
				return async ({ result, update }) => {
					if (result.type === 'success') {
						toast.success('Audio files uploaded successfully');
						isUploading = false;
						clearFiles();
						update();
						$currentTab = 'table';
					} else {
						toast.error('Audio files upload failed');
						isUploading = false;
					}
				};
			}}
			action="?/uploadAudiosAction"
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
				class:opacity-50={isUploading}
				aria-disabled={isUploading}
				class:hover:bg-muted={true}
				ondragenter={handleDrag}
				ondragover={handleDrag}
				ondragleave={handleDrag}
				ondrop={handleDrop}
			>
				<input
					bind:this={fileInput}
					id="audiofiles"
					type="file"
					name="audiofiles"
					accept="audio/*"
					multiple
					class="absolute inset-0 cursor-pointer opacity-0"
					onchange={handleChange}
				/>
				<div class="flex flex-col items-center gap-2">
					<Upload class="h-10 w-10 transition-colors" />
					<div class="flex flex-col gap-1">
						<p class="text-sm font-medium">
							{#if fileCount > 0}
								<span class="text-primary"
									>{fileCount} file{fileCount === 1 ? '' : 's'} selected</span
								>
							{:else}
								Drag & drop audio files here or click to select (max 20 files)
							{/if}
						</p>
						<p class="text-xs text-muted-foreground">Supported formats: MP3, WAV, OGG</p>
					</div>
				</div>
			</div>

			{#if previews.length > 0}
				<div class="grid gap-2" class:animate-pulse={isUploading}>
					{#each previews as preview}
						<div class="group relative rounded-md border bg-muted p-3">
							<button
								disabled={isUploading}
								type="button"
								class="absolute -right-2 -top-2 z-10 hidden rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90 group-hover:block"
								onclick={() => removeFile(preview.name)}
							>
								<X class="h-3 w-3" />
							</button>
							<div class="space-y-2">
								<p class="truncate text-xs text-muted-foreground" title={preview.name}>
									File: {preview.name}
								</p>
								<div class="space-y-1.5">
									<label for={`title-${preview.name}`} class="text-sm font-medium"> Title </label>
									<input
										disabled={isUploading}
										id={`title-${preview.name}`}
										type="text"
										name="titles"
										value={preview.title}
										placeholder="Enter a title for this audio"
										class="w-full rounded-sm border bg-transparent px-2 py-1.5 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
										onchange={(e) =>
											updateTitle(preview.name, (e.target as HTMLInputElement).value)}
									/>
								</div>
							</div>
						</div>
					{/each}
				</div>
				<Button
					disabled={isUploading}
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
