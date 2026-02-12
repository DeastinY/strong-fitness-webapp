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
	<div class="px-6 py-4 border-b border-gray-200">
		<h3 class="text-lg font-semibold text-gray-900">Recent Workouts</h3>
	</div>
	<div class="divide-y divide-gray-100">
		{#each workouts as workout}
			<a
				href="/workouts"
				class="block px-6 py-4 hover:bg-gray-50 transition-colors"
			>
				<div class="flex items-center justify-between">
					<div>
						<p class="font-medium text-gray-900">{workout.name}</p>
						<p class="text-sm text-gray-500">{formatDate(workout.date)}</p>
					</div>
					<div class="flex items-center gap-4 text-sm text-gray-500">
						<span class="flex items-center gap-1">
							<Dumbbell class="w-4 h-4" />
							{formatVolume(workout.total_volume, unit)} {unit}
						</span>
						<span class="flex items-center gap-1">
							<Clock class="w-4 h-4" />
							{formatDuration(workout.duration_minutes)}
						</span>
						<span class="flex items-center gap-1">
							<Layers class="w-4 h-4" />
							{workout.set_count} sets
						</span>
					</div>
				</div>
			</a>
		{:else}
			<div class="px-6 py-8 text-center text-gray-500">
				No workouts yet
			</div>
		{/each}
	</div>
</Card>
