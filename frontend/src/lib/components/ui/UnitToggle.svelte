<script lang="ts">
	import type { Unit } from '$lib/types';

	export let unit: Unit;
</script>

<div class="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1">
	<button
		class="px-3 py-1 text-sm font-medium rounded-md transition-colors {unit === 'lbs'
			? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
			: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
		on:click={() => (unit = 'lbs')}
	>
		lbs
	</button>
	<button
		class="px-3 py-1 text-sm font-medium rounded-md transition-colors {unit === 'kg'
			? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
			: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
		on:click={() => (unit = 'kg')}
	>
		kg
	</button>
</div>
