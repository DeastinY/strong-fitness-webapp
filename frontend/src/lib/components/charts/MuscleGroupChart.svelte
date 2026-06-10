<script lang="ts">
	import type { CategoryVolume, WorkoutWithSets } from '$lib/types';
	import type { Unit } from '$lib/types';
	import { convertWeight } from '$lib/utils';
	import Card from '../ui/Card.svelte';
	import { TrendingUp, TrendingDown, Minus } from 'lucide-svelte';

	export let data: CategoryVolume[];
	export let unit: Unit;
	export let title = 'Muscle Cast Split';
	export let workoutDetails: WorkoutWithSets[] = [];

	interface MuscleGroup {
		label: string;
		bgColor: string;
	}

	const muscleGroups: Record<string, MuscleGroup> = {
		legs:      { label: 'Legs',      bgColor: 'bg-red-500' },
		back:      { label: 'Back',      bgColor: 'bg-blue-500' },
		shoulders: { label: 'Shoulders', bgColor: 'bg-green-500' },
		core:      { label: 'Core',      bgColor: 'bg-purple-500' },
		chest:     { label: 'Chest',     bgColor: 'bg-orange-500' },
		arms:      { label: 'Arms',      bgColor: 'bg-pink-500' },
		other:     { label: 'Other',     bgColor: 'bg-gray-500' },
	};

	function volumeByCategory(workouts: WorkoutWithSets[]): Record<string, number> {
		const vol: Record<string, number> = {};
		for (const w of workouts) {
			for (const s of w.sets) {
				const cat = s.exercise?.category;
				if (!cat || cat === 'cardio' || cat === 'other') continue;
				vol[cat] = (vol[cat] ?? 0) + (s.weight_lbs ?? 0) * (s.reps ?? 0);
			}
		}
		return vol;
	}

	$: trends = (() => {
		const DAY = 86_400_000;
		const now = Date.now();
		const recent = workoutDetails.filter(w => now - new Date(w.date).getTime() <= 30 * DAY);
		const prev = workoutDetails.filter(w => {
			const age = now - new Date(w.date).getTime();
			return age > 30 * DAY && age <= 60 * DAY;
		});
		const rVol = volumeByCategory(recent);
		const pVol = volumeByCategory(prev);
		const result: Record<string, number | null> = {};
		for (const cat of new Set([...Object.keys(rVol), ...Object.keys(pVol)])) {
			const r = rVol[cat] ?? 0;
			const p = pVol[cat] ?? 0;
			result[cat] = p > 0 ? ((r - p) / p) * 100 : r > 0 ? 100 : null;
		}
		return result;
	})();

	$: totalVolume = data.reduce((sum, d) => sum + d.volume, 0);
	$: sortedData = [...data].sort((a, b) => b.volume - a.volume);
	$: maxVolume = sortedData[0]?.volume ?? 0;
</script>

<Card class="p-4 sm:p-6">
	<h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-5">{title}</h3>

	{#if data.length > 0}
		<div class="space-y-3 sm:space-y-4">
			{#each sortedData as item}
				{@const group = muscleGroups[item.category] ?? muscleGroups.other}
				{@const pct = totalVolume > 0 ? (item.volume / totalVolume) * 100 : 0}
				{@const barWidth = maxVolume > 0 ? (item.volume / maxVolume) * 100 : 0}
				{@const trend = trends[item.category] ?? null}

				<div>
					<div class="flex items-center justify-between mb-1.5">
						<!-- Name + dot -->
						<div class="flex items-center gap-2 min-w-0">
							<div class="w-3 h-3 rounded-full flex-shrink-0 {group.bgColor}"></div>
							<span class="font-medium text-sm text-gray-900 dark:text-white truncate">{group.label}</span>
						</div>
						<!-- Volume % + trend -->
						<div class="flex items-center gap-2 flex-shrink-0 ml-2">
							<span class="font-semibold text-sm text-gray-900 dark:text-white">{pct.toFixed(0)}%</span>
							{#if trend !== null}
								{@const up = trend > 3}
								{@const down = trend < -3}
								<div class="flex items-center gap-0.5 text-xs font-medium w-14 justify-end
									{up ? 'text-green-600 dark:text-green-400' : down ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}">
									{#if up}
										<TrendingUp class="w-3 h-3 flex-shrink-0" />
									{:else if down}
										<TrendingDown class="w-3 h-3 flex-shrink-0" />
									{:else}
										<Minus class="w-3 h-3 flex-shrink-0" />
									{/if}
									{trend >= 0 ? '+' : ''}{trend.toFixed(0)}%
								</div>
							{:else}
								<div class="w-14"></div>
							{/if}
						</div>
					</div>
					<div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
						<div class="h-full rounded-full transition-all duration-500 {group.bgColor}" style="width: {barWidth}%"></div>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
			<span class="text-xs text-gray-400 dark:text-gray-500">Momentum: last 30 days vs the 30 before</span>
			<span class="text-sm font-bold text-gray-900 dark:text-white">
				{convertWeight(totalVolume, unit).toLocaleString()} {unit}
			</span>
		</div>
	{:else}
		<div class="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
			No muscle cast data yet
		</div>
	{/if}
</Card>
