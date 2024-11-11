<script lang="ts">
	import type { MediaObject, MediaType } from '$lib/types/visualization';
	import * as Card from '$lib/components/ui/card';
	import { fade } from 'svelte/transition';

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

	// Add effect to handle audio autoplay
	$effect(() => {
		if (audioElement && type === 'audio') {
			try {
				// Try to play the audio when the element is ready
				const playPromise = audioElement.play();
				if (playPromise !== undefined) {
					playPromise.catch((error) => {
						console.error('Audio autoplay failed:', error);
					});
				}
			} catch (error) {
				console.error('Error playing audio:', error);
			}
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
	const getTitle = (obj: MediaObject): string => {
		const title = obj.properties['title'];
		return typeof title === 'string' ? title : '';
	};

	const getMediaUrl = (obj: MediaObject, mediaType: MediaType): string => {
		// Get the correct property based on media type
		const propertyMap: Record<MediaType, string> = {
			image: 'image',
			video: 'video',
			audio: 'audio',
			text: 'text'
		};

		const data = obj.properties[propertyMap[mediaType]];

		if (typeof data !== 'string') {
			return '';
		}

		const mimeTypes: Record<MediaType, string> = {
			image: 'image/jpeg',
			video: 'video/mp4',
			audio: 'audio/mpeg',
			text: 'text/plain'
		};

		const url = `data:${mimeTypes[mediaType]};base64,${data}`;
		return url;
	};

	const getText = (obj: MediaObject): string => {
		const text = obj.properties['text'];
		return typeof text === 'string' ? text : '';
	};
</script>

<div
	class="pointer-events-auto fixed z-50"
	style="left: {position.x}px; top: {position.y}px;"
	transition:fade={{ duration: 200 }}
	role="tooltip"
	onmouseleave={handleMouseLeave}
>
	<Card.Root class="w-[400px] rounded-lg p-0 shadow-lg">
		<Card.Content class="p-2">
			{#if type === 'image' && mediaObject.properties.image}
				<img
					src={getMediaUrl(mediaObject, 'image')}
					alt={getTitle(mediaObject)}
					class="h-auto w-full rounded-lg"
					loading="eager"
					onerror={(e) => console.error('Image failed to load:', e)}
				/>
			{:else if type === 'audio' && mediaObject.properties.audio}
				{@const audioUrl = getMediaUrl(mediaObject, 'audio')}
				<audio
					bind:this={audioElement}
					controls
					class="w-full"
					src={audioUrl}
					onerror={(e) => console.error('Audio failed to load:', e)}
				>
					<track kind="captions" />
				</audio>
			{:else if type === 'video' && mediaObject.properties.video}
				{@const videoUrl = getMediaUrl(mediaObject, 'video')}
				<video
					bind:this={videoElement}
					controls
					autoplay
					muted
					class="w-full"
					src={videoUrl}
					onerror={(e) => console.error('Video failed to load:', e)}
				>
					<track kind="captions" />
				</video>
			{:else if type === 'text' && mediaObject.properties.text}
				<p class="text-sm text-muted-foreground">{getText(mediaObject)}</p>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
