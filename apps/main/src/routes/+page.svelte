<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<form
	method="post"
	use:enhance={() => {
		return async ({ result, update }) => {
			console.log(result);
			// `result` is an `ActionResult` object
			// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
		};
	}}
	enctype="multipart/form-data"
	class="flex flex-col gap-2"
>
	<!-- <div class="flex flex-col gap-2">
		<label for="audiofiles">Audio Files</label>
		<input id="audiofiles" type="file" name="audiofiles" accept="audio/*" multiple />
	</div> -->
	<div class="flex flex-col gap-2">
		<label for="imagefiles">Image Files</label>
		<input id="imagefiles" type="file" name="imagefiles" accept="image/*" multiple />
	</div>
	<button type="submit">Upload</button>
</form>
