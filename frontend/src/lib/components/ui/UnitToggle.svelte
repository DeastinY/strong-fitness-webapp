<script lang="ts">
	import type { Unit } from '$lib/types';

	export let unit: Unit;
</script>

<div class="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
	<button
		class="px-3 py-1 text-sm font-medium rounded-md transition-colors {unit === 'lbs'
			? 'bg-white text-gray-900 shadow-sm'
			: 'text-gray-500 hover:text-gray-700'}"
		on:click={() => (unit = 'lbs')}
	>
		lbs
	</button>
	<button
		class="px-3 py-1 text-sm font-medium rounded-md transition-colors {unit === 'kg'
			? 'bg-white text-gray-900 shadow-sm'
			: 'text-gray-500 hover:text-gray-700'}"
		on:click={() => (unit = 'kg')}
	>
		kg
	</button>
</div>
