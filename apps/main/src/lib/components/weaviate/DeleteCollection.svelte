<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Trash from 'lucide-svelte/icons/trash';
</script>

<form action="/?/deleteCollectionAction" method="POST">
	<Dialog.Root>
		<Dialog.Trigger>
			<Button variant="destructive">
				Delete Collection
				<Trash class="size-4" />
			</Button>
		</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
				<Dialog.Description>
					This action cannot be undone. This will permanently delete this collection and remove your
					data from our servers.
				</Dialog.Description>
			</Dialog.Header>
		</Dialog.Content>
	</Dialog.Root>
</form>
