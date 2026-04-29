<script lang="ts">
	import type { WorkoutSummary } from '$lib/types';
	import Card from '../ui/Card.svelte';
	import { TrendingUp, Target, Calendar } from 'lucide-svelte';

	export let workouts: WorkoutSummary[];
	export let targetPerWeek: number = 3;

	interface WeekData {
		weekStart: Date;
		count: number;
	}

	function getWeekStart(date: Date): Date {
		const d = new Date(date);
		d.setDate(d.getDate() - d.getDay());
		d.setHours(0, 0, 0, 0);
		return d;
	}

	function calculateConsistency(): { score: number; weeks: WeekData[]; avgPerWeek: number; trend: number } {
		if (workouts.length === 0) {
			return { score: 0, weeks: [], avgPerWeek: 0, trend: 0 };
		}

		// Group workouts by week
		const weekMap = new Map<string, number>();
		for (const workout of workouts) {
			const weekStart = getWeekStart(new Date(workout.date));
			const key = weekStart.toISOString();
			weekMap.set(key, (weekMap.get(key) || 0) + 1);
		}

		// Get all weeks in range
		const dates = workouts.map((w) => new Date(w.date));
		const minDate = getWeekStart(new Date(Math.min(...dates.map((d) => d.getTime()))));
		const maxDate = getWeekStart(new Date(Math.max(...dates.map((d) => d.getTime()))));

		const weeks: WeekData[] = [];
		let current = new Date(minDate);
		while (current <= maxDate) {
			weeks.push({
				weekStart: new Date(current),
				count: weekMap.get(current.toISOString()) || 0
			});
			current.setDate(current.getDate() + 7);
		}

		// Calculate metrics
		const totalWorkouts = weeks.reduce((sum, w) => sum + w.count, 0);
		const avgPerWeek = weeks.length > 0 ? totalWorkouts / weeks.length : 0;

		// Score: percentage of weeks meeting target
		const weeksMetTarget = weeks.filter((w) => w.count >= targetPerWeek).length;
		const score = weeks.length > 0 ? Math.round((weeksMetTarget / weeks.length) * 100) : 0;

		// Trend: compare last 4 weeks to previous 4 weeks
		let trend = 0;
		if (weeks.length >= 8) {
			const recent = weeks.slice(-4).reduce((sum, w) => sum + w.count, 0) / 4;
			const previous = weeks.slice(-8, -4).reduce((sum, w) => sum + w.count, 0) / 4;
			if (previous > 0) {
				trend = Math.round(((recent - previous) / previous) * 100);
			}
		}

		return { score, weeks, avgPerWeek, trend };
	}

	$: consistency = calculateConsistency();

	function getScoreColor(score: number): string {
		if (score >= 80) return 'text-green-600 dark:text-green-400';
		if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
		return 'text-red-600 dark:text-red-400';
	}

	function getScoreLabel(score: number): string {
		if (score >= 80) return 'Excellent';
		if (score >= 60) return 'Good';
		if (score >= 40) return 'Fair';
		return 'Needs Work';
	}
</script>

<Card class="p-4 sm:p-6">
	<h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Consistency</h3>

	<div class="flex items-center justify-between mb-4 sm:mb-6">
		<div>
			<div class="text-3xl sm:text-4xl font-bold {getScoreColor(consistency.score)}">
				{consistency.score}%
			</div>
			<div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{getScoreLabel(consistency.score)}</div>
		</div>

		<div class="w-20 h-20 sm:w-24 sm:h-24 relative">
			<svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
				<path
					class="text-gray-200 dark:text-gray-700"
					stroke="currentColor"
					stroke-width="3.5"
					fill="none"
					d="M18 2.0845
						a 15.9155 15.9155 0 0 1 0 31.831
						a 15.9155 15.9155 0 0 1 0 -31.831"
				/>
				<path
					class="{getScoreColor(consistency.score)}"
					stroke="currentColor"
					stroke-width="3.5"
					stroke-linecap="round"
					fill="none"
					stroke-dasharray="{consistency.score}, 100"
					d="M18 2.0845
						a 15.9155 15.9155 0 0 1 0 31.831
						a 15.9155 15.9155 0 0 1 0 -31.831"
				/>
			</svg>
		</div>
	</div>

	<div class="space-y-2.5 sm:space-y-3">
		<div class="flex items-center justify-between text-xs sm:text-sm">
			<div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
				<Target class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
				<span>Target</span>
			</div>
			<span class="font-medium text-gray-900 dark:text-white">{targetPerWeek}x/wk</span>
		</div>

		<div class="flex items-center justify-between text-xs sm:text-sm">
			<div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
				<Calendar class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
				<span>Average</span>
			</div>
			<span class="font-medium text-gray-900 dark:text-white">
				{consistency.avgPerWeek.toFixed(1)}x/wk
			</span>
		</div>

		<div class="flex items-center justify-between text-xs sm:text-sm">
			<div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
				<TrendingUp class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
				<span>Trend</span>
			</div>
			<span class="font-medium {consistency.trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
				{consistency.trend >= 0 ? '+' : ''}{consistency.trend}%
			</span>
		</div>
	</div>

	{#if consistency.weeks.length > 0}
		<div class="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700/50">
			<div class="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-2">Last 12 weeks</div>
			<div class="flex gap-1">
				{#each consistency.weeks.slice(-12) as week}
					{@const c = week.count}
					<div
						class="flex-1 h-9 sm:h-10 rounded flex items-center justify-center text-[10px] font-semibold transition-colors
							{c === 0
								? 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600'
								: c === 1
									? 'bg-amber-200 dark:bg-amber-900 text-amber-700 dark:text-amber-400'
									: c === 2
										? 'bg-amber-400 dark:bg-amber-600 text-amber-900 dark:text-amber-100'
										: 'bg-green-500 dark:bg-green-500 text-white'}"
						title="w/o {week.weekStart.toLocaleDateString()}: {c} workout{c !== 1 ? 's' : ''}"
					>{c > 0 ? c : ''}</div>
				{/each}
			</div>
			<div class="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1 mb-2.5">
				<span>12w ago</span>
				<span>Now</span>
			</div>
			<!-- Legend -->
			<div class="flex items-center gap-2 flex-wrap text-[10px] text-gray-500 dark:text-gray-400">
				<div class="flex items-center gap-1"><div class="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800"></div>0</div>
				<div class="flex items-center gap-1"><div class="w-3 h-3 rounded bg-amber-200 dark:bg-amber-900"></div>1</div>
				<div class="flex items-center gap-1"><div class="w-3 h-3 rounded bg-amber-400 dark:bg-amber-600"></div>2</div>
				<div class="flex items-center gap-1"><div class="w-3 h-3 rounded bg-green-500"></div>3+</div>
				<span class="ml-auto text-gray-400">sessions/week</span>
			</div>
		</div>
	{/if}
</Card>
