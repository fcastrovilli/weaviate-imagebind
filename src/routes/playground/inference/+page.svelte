<script lang="ts">
	let { data } = $props();
	let result = $state(data?.result);
</script>

<div>
	<h1>Inference</h1>
	<pre>{JSON.stringify(result, null, 2)}</pre>
</div>
