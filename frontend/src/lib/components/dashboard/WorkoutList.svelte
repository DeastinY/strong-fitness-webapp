<script lang="ts">
	import type { WorkoutSummary } from '$lib/types';
	import type { Unit } from '$lib/types';
	import { formatDate, formatDuration, formatVolume } from '$lib/utils';
	import Card from '../ui/Card.svelte';
	import { Dumbbell, Clock, Layers } from 'lucide-svelte';

	export let workouts: WorkoutSummary[];
	export let unit: Unit;
</script>

<Card class="overflow-hidden">
	<div class="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700/50">
		<h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Workouts</h3>
	</div>
	<div class="divide-y divide-gray-100 dark:divide-gray-700/50">
		{#each workouts as workout}
			<a
				href="/workouts"
				class="block px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 active:bg-gray-100 dark:active:bg-gray-700/50 transition-colors"
			>
				<div class="flex items-center justify-between gap-3">
					<div class="min-w-0 flex-1">
						<p class="font-medium text-gray-900 dark:text-white truncate">{workout.name}</p>
						<p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{formatDate(workout.date)}</p>
					</div>
					<div class="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
						<span class="hidden sm:flex items-center gap-1">
							<Dumbbell class="w-4 h-4" />
							{formatVolume(workout.total_volume, unit)} {unit}
						</span>
						<span class="flex items-center gap-1">
							<Clock class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							{formatDuration(workout.duration_minutes)}
						</span>
						<span class="flex items-center gap-1">
							<Layers class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							{workout.set_count}
						</span>
					</div>
				</div>
			</a>
		{:else}
			<div class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
				No workouts yet
			</div>
		{/each}
	</div>
</Card>
