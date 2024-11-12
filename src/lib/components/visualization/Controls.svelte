<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { X, RotateCcw } from 'lucide-svelte';
	import { GRAPH_DEFAULTS } from '$lib/utils/visualization';
	import { draggable } from './draggable';

	interface VisualizationParams {
		distanceThreshold: number;
		linkDistance: number;
		linkStrength: number;
		chargeStrength: number;
		centerStrength: number;
		collisionStrength: number;
	}

	let {
		params = $bindable(GRAPH_DEFAULTS.initialParams),
		open = $bindable(false)
	}: {
		params: VisualizationParams;
		open: boolean;
	} = $props();

	function resetParams() {
		params = { ...GRAPH_DEFAULTS.initialParams };
	}
</script>

{#if open}
	<div use:draggable={{ handle: '[data-drag-handle]' }} class="fixed right-8 top-32 z-10">
		<Card.Root class="w-[400px]">
			<Card.Header data-drag-handle class="cursor-move">
				<div class="flex items-center justify-between">
					<div>
						<Card.Title>Graph Settings</Card.Title>
						<Card.Description>Adjust the visualization parameters</Card.Description>
					</div>
					<div class="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							class="h-5 w-5 rounded-full"
							onclick={resetParams}
							title="Reset parameters"
						>
							<RotateCcw class="h-3 w-3" />
						</Button>
						<Button
							variant="destructive"
							size="icon"
							class="h-5 w-5 rounded-full"
							onclick={() => (open = false)}
							title="Close settings"
						>
							<X class="h-3 w-3" />
						</Button>
					</div>
				</div>
			</Card.Header>
			<Card.Content class="grid gap-6">
				<div class="flex flex-col gap-2">
					<div class="flex justify-between">
						<Label for="threshold" class="text-sm">Distance Threshold</Label>
						<span class="text-sm text-muted-foreground">{params.distanceThreshold.toFixed(2)}</span>
					</div>
					<input
						id="threshold"
						type="range"
						min="0"
						max="1"
						step="0.01"
						bind:value={params.distanceThreshold}
						class="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<div class="flex justify-between">
						<Label for="linkDistance" class="text-sm">Link Distance</Label>
						<span class="text-sm text-muted-foreground">{params.linkDistance}</span>
					</div>
					<input
						id="linkDistance"
						type="range"
						min="20"
						max="300"
						step="5"
						bind:value={params.linkDistance}
						class="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<div class="flex justify-between">
						<Label for="linkStrength" class="text-sm">Link Strength</Label>
						<span class="text-sm text-muted-foreground">{params.linkStrength.toFixed(2)}</span>
					</div>
					<input
						id="linkStrength"
						type="range"
						min="0"
						max="1"
						step="0.05"
						bind:value={params.linkStrength}
						class="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<div class="flex justify-between">
						<Label for="chargeStrength" class="text-sm">Charge Strength</Label>
						<span class="text-sm text-muted-foreground">{params.chargeStrength}</span>
					</div>
					<input
						id="chargeStrength"
						type="range"
						min="-500"
						max="0"
						step="20"
						bind:value={params.chargeStrength}
						class="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<div class="flex justify-between">
						<Label for="centerStrength" class="text-sm">Center Strength</Label>
						<span class="text-sm text-muted-foreground">{params.centerStrength.toFixed(2)}</span>
					</div>
					<input
						id="centerStrength"
						type="range"
						min="0"
						max="2"
						step="0.1"
						bind:value={params.centerStrength}
						class="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<div class="flex justify-between">
						<Label for="collisionStrength" class="text-sm">Collision Strength</Label>
						<span class="text-sm text-muted-foreground">{params.collisionStrength.toFixed(2)}</span>
					</div>
					<input
						id="collisionStrength"
						type="range"
						min="0"
						max="1"
						step="0.05"
						bind:value={params.collisionStrength}
						class="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
					/>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
{/if}
