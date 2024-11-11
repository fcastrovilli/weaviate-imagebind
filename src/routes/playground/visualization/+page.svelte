<script lang="ts">
	let { data } = $props();
	let files = $state(data?.files ?? []);
</script>

<pre>{JSON.stringify(files, null, 2)}</pre>
