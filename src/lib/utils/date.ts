export function formatDate(dateString: string | null | undefined): string {
	if (!dateString) return 'N/A';

	try {
		// First check if it's a timestamp in milliseconds
		const timestamp = parseInt(dateString);
		if (!isNaN(timestamp)) {
			const date = new Date(timestamp);
			if (isValidDate(date)) {
				return formatDateObject(date);
			}
		}

		// Try parsing as ISO string
		const date = new Date(dateString);
		if (isValidDate(date)) {
			return formatDateObject(date);
		}

		return 'Invalid date';
	} catch (error) {
		console.error('Error formatting date:', error);
		return 'Invalid date';
	}
}

function isValidDate(date: Date): boolean {
	return date instanceof Date && !isNaN(date.getTime());
}

function formatDateObject(date: Date): string {
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
}
