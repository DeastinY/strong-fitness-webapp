<script lang="ts">
	import type { CategoryVolume } from '$lib/types';
	import type { Unit } from '$lib/types';
	import { convertWeight } from '$lib/utils';
	import Card from '../ui/Card.svelte';

	export let data: CategoryVolume[];
	export let unit: Unit;
	export let title = 'Volume by Muscle Group';

	interface MuscleGroup {
		id: string;
		label: string;
		bgColor: string;
		description: string;
	}

	const muscleGroups: Record<string, MuscleGroup> = {
		legs: {
			id: 'legs',
			label: 'Legs',
			bgColor: 'bg-red-500',
			description: 'Quads, Hamstrings, Calves'
		},
		back: {
			id: 'back',
			label: 'Back',
			bgColor: 'bg-blue-500',
			description: 'Lats, Rhomboids, Traps'
		},
		shoulders: {
			id: 'shoulders',
			label: 'Shoulders',
			bgColor: 'bg-green-500',
			description: 'Deltoids, Rotator Cuff'
		},
		core: {
			id: 'core',
			label: 'Core',
			bgColor: 'bg-purple-500',
			description: 'Abs, Obliques, Lower Back'
		},
		chest: {
			id: 'chest',
			label: 'Chest',
			bgColor: 'bg-orange-500',
			description: 'Pectorals'
		},
		arms: {
			id: 'arms',
			label: 'Arms',
			bgColor: 'bg-pink-500',
			description: 'Biceps, Triceps, Forearms'
		},
		other: {
			id: 'other',
			label: 'Other',
			bgColor: 'bg-gray-500',
			description: 'Miscellaneous'
		}
	};

	$: totalVolume = data.reduce((sum, d) => sum + d.volume, 0);
	$: sortedData = [...data].sort((a, b) => b.volume - a.volume);
	$: maxVolume = sortedData.length > 0 ? sortedData[0].volume : 0;
</script>

<Card class="p-4 sm:p-6">
	<h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">{title}</h3>

	{#if data.length > 0}
		<div class="space-y-3 sm:space-y-4">
			{#each sortedData as item}
				{@const group = muscleGroups[item.category] || muscleGroups.other}
				{@const percentage = totalVolume > 0 ? (item.volume / totalVolume) * 100 : 0}
				{@const barWidth = maxVolume > 0 ? (item.volume / maxVolume) * 100 : 0}
				{@const volumeDisplay = convertWeight(item.volume, unit).toLocaleString()}

				<div class="group">
					<div class="flex items-center justify-between mb-1.5 sm:mb-2">
						<div class="flex items-center gap-2 sm:gap-3 min-w-0">
							<div class="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 {group.bgColor}"></div>
							<span class="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{group.label}</span>
						</div>
						<div class="text-right flex-shrink-0 ml-2">
							<span class="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{percentage.toFixed(0)}%</span>
						</div>
					</div>
					<div class="h-2.5 sm:h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
						<div
							class="h-full rounded-full transition-all duration-500 ease-out {group.bgColor}"
							style="width: {barWidth}%"
						></div>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-700/50">
			<div class="flex items-center justify-between">
				<span class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total</span>
				<span class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
					{convertWeight(totalVolume, unit).toLocaleString()} {unit}
				</span>
			</div>
		</div>
	{:else}
		<div class="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
			No data available
		</div>
	{/if}
</Card>
