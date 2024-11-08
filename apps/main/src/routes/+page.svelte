<script lang="ts">
	import CompareImages from '$lib/components/weaviate/CompareImages.svelte';
	import UploadImages from '$lib/components/weaviate/UploadImages.svelte';
	import ViewImages from '$lib/components/weaviate/ViewImages.svelte';

	let { data } = $props();
	let images = $state(data.images);
</script>

<UploadImages />
<ViewImages {images} />
<CompareImages />
