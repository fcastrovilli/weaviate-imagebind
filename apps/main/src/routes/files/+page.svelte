<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { items } from '$lib/components/layout/nav-main.svelte';
	import ImageIcon from 'lucide-svelte/icons/image';
	import AudioIcon from 'lucide-svelte/icons/audio-waveform';
	import VideoIcon from 'lucide-svelte/icons/video';
	import TextIcon from 'lucide-svelte/icons/file-text';

	type IconMapKey = 'Images' | 'Audios' | 'Videos' | 'Texts';

	const iconMap: Record<
		IconMapKey,
		typeof ImageIcon | typeof AudioIcon | typeof VideoIcon | typeof TextIcon
	> = {
		Images: ImageIcon,
		Audios: AudioIcon,
		Videos: VideoIcon,
		Texts: TextIcon
	};
</script>

<div class="grid gap-6 md:grid-cols-2">
	{#each items[0].items as item}
		<a
			href={item.url}
			class="transition-transform duration-200 hover:-translate-y-1 hover:no-underline"
		>
			<Card.Root class="group h-full">
				<Card.Header class="flex flex-row items-start justify-between space-y-0 pb-2">
					<div
						class="flex size-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20"
					>
						<svelte:component
							this={iconMap[item.title as IconMapKey]}
							class="size-6 text-primary"
						/>
					</div>
				</Card.Header>
				<Card.Content>
					<Card.Title class="text-2xl">{item.title}</Card.Title>
					<Card.Description class="mt-2">
						{#if item.title === 'Images'}
							Upload, manage and analyze your image files. Compare visual similarities and search
							through your collection.
						{:else if item.title === 'Audios'}
							Store and organize your audio files. Process and analyze audio content.
						{:else if item.title === 'Videos'}
							Manage your video collection. Upload and organize video content.
						{:else if item.title === 'Texts'}
							Store and analyze text documents. Process and search through text content.
						{/if}
					</Card.Description>
				</Card.Content>
			</Card.Root>
		</a>
	{/each}
</div>
