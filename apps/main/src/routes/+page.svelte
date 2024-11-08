<script lang="ts">
	import ViewImages from '$lib/components/weaviate/ViewImages.svelte';

	let { data } = $props();
</script>

<ViewImages images={data.images} />
