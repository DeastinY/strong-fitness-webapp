<script lang="ts">
	import type { Exercise } from '$lib/types';
	import { getCategoryColor } from '$lib/utils';

	export let exercises: Exercise[];
	export let selectedId: number | null = null;
</script>

<div class="relative">
	<select
		bind:value={selectedId}
		class="block w-full px-4 py-2 pr-8 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
	>
		<option value={null}>Select an exercise</option>
		{#each exercises as exercise}
			<option value={exercise.id}>
				{exercise.name}
			</option>
		{/each}
	</select>
	<div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
		<svg class="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
			<path
				fill-rule="evenodd"
				d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
				clip-rule="evenodd"
			/>
		</svg>
	</div>
</div>
