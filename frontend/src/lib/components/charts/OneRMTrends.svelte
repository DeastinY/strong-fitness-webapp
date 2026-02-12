<script lang="ts">
	import type { WorkoutWithSets } from '$lib/types';
	import Card from '../ui/Card.svelte';
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';

	export let workoutDetails: WorkoutWithSets[];

	Chart.register(...registerables);

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	interface ExerciseData {
		name: string;
		data: { date: string; estimated1RM: number }[];
	}

	// Epley formula: 1RM = weight × (1 + reps/30)
	function calculate1RM(weight: number, reps: number): number {
		if (reps === 1) return weight;
		return weight * (1 + reps / 30);
	}

	function getExercise1RMData(): ExerciseData[] {
		const exerciseMap = new Map<string, Map<string, number>>();

		for (const workout of workoutDetails) {
			const dateStr = new Date(workout.date).toLocaleDateString();

			for (const set of workout.sets) {
				if (!set.weight_lbs || !set.reps || set.exercise?.category === 'cardio') continue;

				const name = set.exercise?.name || 'Unknown';
				const estimated1RM = calculate1RM(set.weight_lbs, set.reps);

				if (!exerciseMap.has(name)) {
					exerciseMap.set(name, new Map());
				}

				const dateMap = exerciseMap.get(name)!;
				const current = dateMap.get(dateStr) || 0;
				if (estimated1RM > current) {
					dateMap.set(dateStr, estimated1RM);
				}
			}
		}

		// Convert to array and sort by total volume (to get most trained exercises)
		const results: ExerciseData[] = [];
		for (const [name, dateMap] of exerciseMap) {
			const data = Array.from(dateMap.entries())
				.map(([date, estimated1RM]) => ({ date, estimated1RM }))
				.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

			if (data.length >= 2) {
				results.push({ name, data });
			}
		}

		// Sort by number of data points and return top 5
		return results
			.sort((a, b) => b.data.length - a.data.length)
			.slice(0, 5);
	}

	const colors = [
		{ border: 'rgb(59, 130, 246)', bg: 'rgba(59, 130, 246, 0.1)' },
		{ border: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.1)' },
		{ border: 'rgb(34, 197, 94)', bg: 'rgba(34, 197, 94, 0.1)' },
		{ border: 'rgb(168, 85, 247)', bg: 'rgba(168, 85, 247, 0.1)' },
		{ border: 'rgb(249, 115, 22)', bg: 'rgba(249, 115, 22, 0.1)' }
	];

	function createChart() {
		if (!canvas) return;

		const exerciseData = getExercise1RMData();
		if (exerciseData.length === 0) return;

		// Get all unique dates
		const allDates = new Set<string>();
		for (const exercise of exerciseData) {
			for (const point of exercise.data) {
				allDates.add(point.date);
			}
		}
		const labels = Array.from(allDates).sort(
			(a, b) => new Date(a).getTime() - new Date(b).getTime()
		);

		const datasets = exerciseData.map((exercise, i) => {
			const color = colors[i % colors.length];
			const dataMap = new Map(exercise.data.map((d) => [d.date, d.estimated1RM]));

			return {
				label: exercise.name,
				data: labels.map((date) => dataMap.get(date) || null),
				borderColor: color.border,
				backgroundColor: color.bg,
				tension: 0.3,
				fill: false,
				spanGaps: true,
				pointRadius: 4,
				pointHoverRadius: 6
			};
		});

		if (chart) {
			chart.destroy();
		}

		const isDark = document.documentElement.classList.contains('dark');

		chart = new Chart(canvas, {
			type: 'line',
			data: { labels, datasets },
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					intersect: false,
					mode: 'index'
				},
				plugins: {
					legend: {
						position: 'bottom',
						labels: {
							usePointStyle: true,
							padding: 20,
							color: isDark ? '#d1d5db' : '#374151'
						}
					},
					tooltip: {
						callbacks: {
							label: (context) => {
								const value = context.parsed.y;
								return `${context.dataset.label}: ${Math.round(value)} lbs (est. 1RM)`;
							}
						}
					}
				},
				scales: {
					x: {
						grid: {
							color: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0, 0, 0, 0.1)'
						},
						ticks: {
							color: isDark ? '#9ca3af' : '#6b7280'
						}
					},
					y: {
						beginAtZero: false,
						grid: {
							color: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0, 0, 0, 0.1)'
						},
						ticks: {
							color: isDark ? '#9ca3af' : '#6b7280',
							callback: (value) => `${value} lbs`
						}
					}
				}
			}
		});
	}

	$: if (workoutDetails && canvas) {
		createChart();
	}

	onMount(() => {
		createChart();
		return () => {
			if (chart) chart.destroy();
		};
	});

	$: exerciseData = getExercise1RMData();
	$: progressSummary = exerciseData.map((ex) => {
		const first = ex.data[0]?.estimated1RM || 0;
		const last = ex.data[ex.data.length - 1]?.estimated1RM || 0;
		const change = first > 0 ? ((last - first) / first) * 100 : 0;
		return { name: ex.name, first, last, change };
	});
</script>

<Card class="p-6">
	<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estimated 1RM Trends</h3>

	{#if exerciseData.length > 0}
		<div class="h-64 mb-4">
			<canvas bind:this={canvas}></canvas>
		</div>

		<div class="border-t border-gray-200 dark:border-gray-700 pt-4">
			<div class="text-sm text-gray-500 dark:text-gray-400 mb-2">Progress Summary</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
				{#each progressSummary as item, i}
					<div class="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
						<div class="flex items-center gap-2">
							<div
								class="w-3 h-3 rounded-full"
								style="background-color: {colors[i % colors.length].border}"
							></div>
							<span class="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
								{item.name}
							</span>
						</div>
						<span
							class="text-sm font-medium {item.change >= 0
								? 'text-green-600 dark:text-green-400'
								: 'text-red-600 dark:text-red-400'}"
						>
							{item.change >= 0 ? '+' : ''}{item.change.toFixed(0)}%
						</span>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
			Need at least 2 sessions per exercise to show trends
		</div>
	{/if}
</Card>
