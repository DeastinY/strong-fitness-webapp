<script lang="ts">
	import { yearFilter } from '$lib/stores/yearFilter';

	// Years present in the dataset — extend as new years are added
	const YEARS = [2025, 2026];

	function set(year: number | null) {
		yearFilter.set(year);
	}
</script>

<div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
	{#each YEARS as year}
		<button
			class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors
				{$yearFilter === year
					? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
					: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}"
			on:click={() => set(year)}
		>{year}</button>
	{/each}
	<button
		class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors
			{$yearFilter === null
				? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
				: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}"
		on:click={() => set(null)}
	>All</button>
</div>
