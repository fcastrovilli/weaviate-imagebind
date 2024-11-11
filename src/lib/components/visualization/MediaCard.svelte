<script lang="ts">
	import type { MediaObject, MediaType } from '$lib/types/visualization';
	import * as Card from '$lib/components/ui/card';
	import { fade } from 'svelte/transition';
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

	let getMediaForm: HTMLFormElement | undefined = $state();
	let currentUuid: string = $state(mediaObject.uuid);

	// Reset media data when uuid changes
	$effect(() => {
		if (!mediaObject) {
			console.warn('MediaCard received null mediaObject');
			return;
		}
		if (currentUuid !== mediaObject.uuid) {
			mediaData = null;
			currentUuid = mediaObject.uuid;
		}
	});

	// Load media data when component mounts or uuid changes
	$effect(() => {
		if (!mediaObject) return;
		if (type !== 'text' && !mediaData && !isLoading) {
			getMediaForm?.requestSubmit();
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
					action="/playground/visualization?/getMediaData"
					use:enhance={() => {
						isLoading = true;
						const targetUuid = mediaObject?.uuid;

						return async ({ result }) => {
							if (result.type === 'success' && targetUuid === mediaObject?.uuid) {
								mediaData = result.data?.mediaData as string | null;
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
						<span class="loading loading-spinner"> Loading media data... </span>
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
