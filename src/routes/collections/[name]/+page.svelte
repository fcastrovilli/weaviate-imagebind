<script lang="ts">
	import DeleteCollection from '$lib/components/weaviate/DeleteCollection.svelte';

	let { data } = $props();
	let collection = $state(data.collection);
</script>

{#if collection}
	<DeleteCollection collectionName={collection.name} />
{/if}
