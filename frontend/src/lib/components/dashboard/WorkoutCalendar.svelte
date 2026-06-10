<script lang="ts">
	import type { WorkoutSummary } from '$lib/types';
	import Card from '../ui/Card.svelte';

	export let workouts: WorkoutSummary[];

	interface DayData {
		date: Date;
		volume: number;
		count: number;
		isCurrentMonth: boolean;
	}

	$: workoutMap = new Map(
		workouts.map((w) => [new Date(w.date).toDateString(), w.total_volume])
	);

	$: maxVolume = Math.max(...workouts.map((w) => w.total_volume), 1);

	function getCalendarDays(year: number, month: number): DayData[] {
		const days: DayData[] = [];
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const startPadding = firstDay.getDay();

		// Previous month padding
		for (let i = startPadding - 1; i >= 0; i--) {
			const date = new Date(year, month, -i);
			days.push({
				date,
				volume: workoutMap.get(date.toDateString()) || 0,
				count: workoutMap.has(date.toDateString()) ? 1 : 0,
				isCurrentMonth: false
			});
		}

		// Current month
		for (let i = 1; i <= lastDay.getDate(); i++) {
			const date = new Date(year, month, i);
			days.push({
				date,
				volume: workoutMap.get(date.toDateString()) || 0,
				count: workoutMap.has(date.toDateString()) ? 1 : 0,
				isCurrentMonth: true
			});
		}

		// Next month padding
		const remaining = 42 - days.length;
		for (let i = 1; i <= remaining; i++) {
			const date = new Date(year, month + 1, i);
			days.push({
				date,
				volume: workoutMap.get(date.toDateString()) || 0,
				count: workoutMap.has(date.toDateString()) ? 1 : 0,
				isCurrentMonth: false
			});
		}

		return days;
	}

	function getIntensityClass(volume: number): string {
		if (volume === 0) return 'bg-gray-100 dark:bg-gray-800';
		const intensity = volume / maxVolume;
		if (intensity > 0.75) return 'bg-green-600 dark:bg-green-500';
		if (intensity > 0.5) return 'bg-green-500 dark:bg-green-400';
		if (intensity > 0.25) return 'bg-green-400 dark:bg-green-300';
		return 'bg-green-300 dark:bg-green-200';
	}

	const now = new Date();
	let currentMonth = now.getMonth();
	let currentYear = 2026; // Filtered to 2026

	$: calendarDays = getCalendarDays(currentYear, currentMonth);
	$: monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
		month: 'long',
		year: 'numeric'
	});

	const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	function prevMonth() {
		if (currentMonth === 0) {
			currentMonth = 11;
			currentYear--;
		} else {
			currentMonth--;
		}
	}

	function nextMonth() {
		if (currentMonth === 11) {
			currentMonth = 0;
			currentYear++;
		} else {
			currentMonth++;
		}
	}
</script>

<Card class="p-4 sm:p-6">
	<div class="flex items-center justify-between mb-4">
		<h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Attendance Heatboard</h3>
		<div class="flex items-center gap-1 sm:gap-2">
			<button
				on:click={prevMonth}
				class="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
			>
				<svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
			<span class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[100px] sm:min-w-[140px] text-center">
				{monthName}
			</span>
			<button
				on:click={nextMonth}
				class="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
			>
				<svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>
		</div>
	</div>

	<div class="grid grid-cols-7 gap-0.5 sm:gap-1">
		{#each weekdays as day}
			<div class="text-center text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 py-1 sm:py-2">
				{day.slice(0, 1)}
			</div>
		{/each}

		{#each calendarDays as day}
			<div
				class="aspect-square rounded sm:rounded-md flex items-center justify-center text-[10px] sm:text-xs font-medium transition-colors
					{day.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}
					{getIntensityClass(day.volume)}"
				title={day.volume > 0 ? `${day.date.toLocaleDateString()}: ${Math.round(day.volume).toLocaleString()} lbs of staged load` : ''}
			>
				{day.date.getDate()}
			</div>
		{/each}
	</div>

	<div class="mt-3 sm:mt-4 flex items-center justify-end gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
		<span>Lighter</span>
		<div class="flex gap-0.5 sm:gap-1">
			<div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
			<div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-green-300 dark:bg-green-700"></div>
			<div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-green-400 dark:bg-green-600"></div>
			<div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-green-500 dark:bg-green-500"></div>
			<div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-green-600 dark:bg-green-400"></div>
		</div>
		<span>Heavier</span>
	</div>
</Card>
