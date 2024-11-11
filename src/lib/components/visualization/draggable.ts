interface DraggableOptions {
	handle?: string;
}

export function draggable(node: HTMLElement, options: DraggableOptions = {}) {
	let startX: number;
	let startY: number;
	let initialX: number;
	let initialY: number;

	function handleMousedown(event: MouseEvent) {
		if (options.handle) {
			const target = event.target as HTMLElement;
			if (!target.closest(options.handle)) return;
		}

		// Get initial positions
		const rect = node.getBoundingClientRect();
		initialX = rect.left;
		initialY = rect.top;
		startX = event.clientX;
		startY = event.clientY;

		// Add event listeners
		window.addEventListener('mousemove', handleMousemove);
		window.addEventListener('mouseup', handleMouseup);

		// Prevent text selection
		event.preventDefault();
	}

	function handleMousemove(event: MouseEvent) {
		const dx = event.clientX - startX;
		const dy = event.clientY - startY;

		const newX = initialX + dx;
		const newY = initialY + dy;

		// Keep within window bounds
		const maxX = window.innerWidth - node.offsetWidth;
		node.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
		node.style.top = `${Math.max(0, newY)}px`;
	}

	function handleMouseup() {
		window.removeEventListener('mousemove', handleMousemove);
		window.removeEventListener('mouseup', handleMouseup);
	}

	// Initial setup
	node.style.position = 'fixed';
	node.addEventListener('mousedown', handleMousedown);

	return {
		destroy() {
			node.removeEventListener('mousedown', handleMousedown);
		}
	};
}
