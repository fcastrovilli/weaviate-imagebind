<script lang="ts">
	import ViewImages from '$lib/components/weaviate/ViewImages.svelte';
	let { data } = $props();
	let images = $derived(data.images);
</script>

<ViewImages {images} />
