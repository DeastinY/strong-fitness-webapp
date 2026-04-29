<script lang="ts">
	import type { WorkoutWithSets } from '$lib/types';
	import Card from '../ui/Card.svelte';
	import { TrendingUp, TrendingDown, Minus } from 'lucide-svelte';

	export let workoutDetails: WorkoutWithSets[];

	const LABELS: Record<string, string> = {
		legs: 'Legs',
		back: 'Back',
		shoulders: 'Shoulders',
		core: 'Core',
		arms: 'Arms',
		chest: 'Chest'
	};

	const COLORS: Record<string, string> = {
		legs: 'bg-red-500',
		back: 'bg-blue-500',
		shoulders: 'bg-green-500',
		core: 'bg-purple-500',
		arms: 'bg-pink-500',
		chest: 'bg-orange-500'
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

	$: items = (() => {
		const DAY = 86_400_000;
		const now = Date.now();

		const recent = workoutDetails.filter(w => now - new Date(w.date).getTime() <= 30 * DAY);
		const prev = workoutDetails.filter(w => {
			const age = now - new Date(w.date).getTime();
			return age > 30 * DAY && age <= 60 * DAY;
		});

		const rVol = volumeByCategory(recent);
		const pVol = volumeByCategory(prev);

		const cats = [...new Set([...Object.keys(rVol), ...Object.keys(pVol)])].filter(
			c => c in LABELS
		);

		return cats
			.map(cat => {
				const r = rVol[cat] ?? 0;
				const p = pVol[cat] ?? 0;
				const pct = p > 0 ? ((r - p) / p) * 100 : r > 0 ? 100 : 0;
				return { cat, pct };
			})
			.sort((a, b) => b.pct - a.pct);
	})();
</script>

<Card class="p-4 sm:p-6">
	<div class="flex items-baseline gap-2 mb-4">
		<h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Muscle Group Progress</h3>
		<span class="text-xs text-gray-400 dark:text-gray-500">past month vs previous</span>
	</div>

	{#if items.length > 0}
		<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
			{#each items as item}
				{@const up = item.pct > 3}
				{@const down = item.pct < -3}
				<div class="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
					<div class="flex items-center gap-2 min-w-0">
						<div class="w-2.5 h-2.5 rounded-full flex-shrink-0 {COLORS[item.cat] ?? 'bg-gray-400'}"></div>
						<span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
							{LABELS[item.cat]}
						</span>
					</div>
					<div
						class="flex items-center gap-0.5 flex-shrink-0 ml-2 font-semibold text-sm
							{up ? 'text-green-600 dark:text-green-400' : down ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}"
					>
						{#if up}
							<TrendingUp class="w-3.5 h-3.5" />
						{:else if down}
							<TrendingDown class="w-3.5 h-3.5" />
						{:else}
							<Minus class="w-3.5 h-3.5" />
						{/if}
						{item.pct >= 0 ? '+' : ''}{item.pct.toFixed(0)}%
					</div>
				</div>
			{/each}
		</div>
		<p class="text-xs text-gray-400 dark:text-gray-500 mt-3">Volume (weight × reps) vs same window prior month</p>
	{:else}
		<div class="h-20 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
			Need workouts from two consecutive months
		</div>
	{/if}
</Card>
