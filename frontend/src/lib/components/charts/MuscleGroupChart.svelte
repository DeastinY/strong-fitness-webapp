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

<Card class="p-6">
	<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">{title}</h3>

	{#if data.length > 0}
		<div class="space-y-4">
			{#each sortedData as item}
				{@const group = muscleGroups[item.category] || muscleGroups.other}
				{@const percentage = totalVolume > 0 ? (item.volume / totalVolume) * 100 : 0}
				{@const barWidth = maxVolume > 0 ? (item.volume / maxVolume) * 100 : 0}
				{@const volumeDisplay = convertWeight(item.volume, unit).toLocaleString()}

				<div class="group">
					<div class="flex items-center justify-between mb-2">
						<div class="flex items-center gap-3">
							<div class="w-4 h-4 rounded-full {group.bgColor}"></div>
							<div>
								<span class="font-medium text-gray-900 dark:text-white">{group.label}</span>
								<span class="text-xs text-gray-500 dark:text-gray-400 ml-2">{group.description}</span>
							</div>
						</div>
						<div class="text-right">
							<span class="font-semibold text-gray-900 dark:text-white">{volumeDisplay}</span>
							<span class="text-gray-500 dark:text-gray-400 text-sm ml-1">{unit}</span>
							<span class="text-gray-400 dark:text-gray-500 text-sm ml-2">({percentage.toFixed(1)}%)</span>
						</div>
					</div>
					<div class="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
						<div
							class="h-full rounded-full transition-all duration-500 ease-out {group.bgColor}"
							style="width: {barWidth}%"
						></div>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
			<div class="flex items-center justify-between">
				<span class="text-sm text-gray-500 dark:text-gray-400">Total Volume</span>
				<span class="text-lg font-bold text-gray-900 dark:text-white">
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
