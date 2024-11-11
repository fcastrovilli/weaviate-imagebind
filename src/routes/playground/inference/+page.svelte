<script lang="ts">
	let { data } = $props();
	let audioFiles = $state(data.audios);
	let imageFiles = $state(data.images);
</script>

<div>
	<h1>Inference</h1>
	<h2>Audio Files</h2>
	<pre>{JSON.stringify(audioFiles, null, 2)}</pre>
	<h2>Image Files</h2>
	<pre>{JSON.stringify(imageFiles, null, 2)}</pre>
</div>
