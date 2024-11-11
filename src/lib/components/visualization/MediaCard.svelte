<script lang="ts">
	import type { MediaObject, MediaType } from '$lib/types/visualization';
	import * as Card from '$lib/components/ui/card';
	import { fade } from 'svelte/transition';
	import { mediaCache } from '$lib/utils/cache';
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';

	interface Position {
		x: number;
		y: number;
	}

	let {
		mediaObject,
		position,
		type
	}: {
		mediaObject: MediaObject;
		position: Position;
		type: MediaType;
	} = $props();

	let audioElement: HTMLAudioElement | undefined = $state();
	let videoElement: HTMLVideoElement | undefined = $state();

	let mediaData: string | null = $state(null);
	let isLoading = $state(false);
	let currentUuid: string = $state(mediaObject.uuid);
	let getMediaForm: HTMLFormElement | undefined = $state();

	async function loadMediaData() {
		if (!mediaObject || type === 'text' || isLoading) return;

		const cacheKey = `${mediaObject.uuid}-${type}`;

		// First check cache
		if (browser && mediaCache.has(cacheKey)) {
			mediaData = mediaCache.get(cacheKey) || null;
			return;
		}

		// If not in cache, use form action
		getMediaForm?.requestSubmit();
	}

	// Initial load and UUID changes
	$effect(() => {
		// Skip if no media object or if it's text type
		if (!mediaObject || type === 'text') return;

		// If UUID changed
		if (currentUuid !== mediaObject.uuid) {
			// Reset states
			mediaData = null;
			isLoading = false;
			currentUuid = mediaObject.uuid;

			// Try to load from cache or trigger form
			loadMediaData();
		}
		// If same node but no media data and not loading
		else if (!mediaData && !isLoading) {
			loadMediaData();
		}
	});

	function handleMouseLeave() {
		if (audioElement) {
			audioElement.pause();
			audioElement.currentTime = 0;
		}
		if (videoElement) {
			videoElement.pause();
			videoElement.currentTime = 0;
		}
	}

	// Type-safe property getters with base64 handling
	const getTitle = (obj: MediaObject | null): string => {
		if (!obj) return '';
		const title = obj.properties['title'];
		return typeof title === 'string' ? title : '';
	};

	const getMediaUrl = (data: string, mediaType: MediaType): string => {
		if (!data) return '';

		const mimeTypes: Record<MediaType, string> = {
			image: 'image/jpeg',
			video: 'video/mp4',
			audio: 'audio/mpeg',
			text: 'text/plain'
		};

		return `data:${mimeTypes[mediaType]};base64,${data}`;
	};

	const getText = (obj: MediaObject): string => {
		const text = obj.properties['text'];
		return typeof text === 'string' ? text : '';
	};
</script>

<div
	class="pointer-events-auto fixed z-50"
	style="left: {position.x}px; top: {position.y}px;"
	transition:fade={{ duration: 100 }}
	role="tooltip"
	onmouseleave={handleMouseLeave}
>
	<Card.Root class="w-[400px] rounded-lg p-0 shadow-lg">
		<Card.Content class="p-2">
			{#if !mediaObject}
				<div class="flex h-32 items-center justify-center">
					<span class="text-sm text-muted-foreground">No media object available</span>
				</div>
			{:else if type !== 'text' && (!mediaData || currentUuid !== mediaObject.uuid)}
				<form
					bind:this={getMediaForm}
					method="POST"
					action="?/getMediaData"
					use:enhance={() => {
						isLoading = true;
						const targetUuid = mediaObject.uuid;

						return async ({ result }) => {
							if (result.type === 'success' && targetUuid === mediaObject?.uuid) {
								const data = result.data?.mediaData as string;
								// Store in cache
								if (data) {
									const cacheKey = `${targetUuid}-${type}`;
									mediaCache.set(cacheKey, data);
								}
								mediaData = data;
							}
							isLoading = false;
						};
					}}
				>
					<input type="hidden" name="uuid" value={mediaObject.uuid} />
					<input type="hidden" name="mediaType" value={type} />
					<input
						type="hidden"
						name="collection"
						value={document.cookie.match(/lastSelectedCollection=([^;]+)/)?.[1] || ''}
					/>
					<div class="flex h-32 items-center justify-center">
						<span class="loading loading-spinner">Loading media data...</span>
					</div>
				</form>
			{:else if type === 'image' && mediaData && currentUuid === mediaObject.uuid}
				<img
					src={getMediaUrl(mediaData, 'image')}
					alt={getTitle(mediaObject)}
					class="h-auto w-full rounded-lg"
					loading="eager"
				/>
			{:else if type === 'audio' && mediaData && currentUuid === mediaObject.uuid}
				<audio
					bind:this={audioElement}
					controls
					class="w-full"
					src={getMediaUrl(mediaData, 'audio')}
				>
					<track kind="captions" />
				</audio>
			{:else if type === 'video' && mediaData && currentUuid === mediaObject.uuid}
				<video
					bind:this={videoElement}
					controls
					autoplay
					muted
					class="w-full"
					src={getMediaUrl(mediaData, 'video')}
				>
					<track kind="captions" />
				</video>
			{:else if type === 'text'}
				<p class="text-sm text-muted-foreground">{getText(mediaObject)}</p>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
