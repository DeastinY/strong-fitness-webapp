<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import type { ExerciseProgress } from '$lib/types';
	import type { Unit } from '$lib/types';
	import { convertWeight } from '$lib/utils';
	import Card from '../ui/Card.svelte';

	export let data: ExerciseProgress[];
	export let unit: Unit;
	export let title = 'Exercise Progress';

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	Chart.register(...registerables);

	function shortDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function createChart() {
		if (chart) chart.destroy();

		const isDark = document.documentElement.classList.contains('dark');
		const gridColor = isDark ? 'rgba(75,85,99,0.3)' : 'rgba(0,0,0,0.08)';
		const tickColor = isDark ? '#9ca3af' : '#6b7280';
		const labelColor = isDark ? '#d1d5db' : '#374151';

		chart = new Chart(canvas, {
			type: 'bar',
			data: {
				labels: data.map(d => shortDate(d.date)),
				datasets: [
					{
						type: 'bar',
						label: `Volume (${unit})`,
						data: data.map(d => convertWeight(d.total_volume, unit)),
						backgroundColor: isDark ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.18)',
						borderColor: isDark ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.4)',
						borderWidth: 1,
						yAxisID: 'y1',
						order: 2
					},
					{
						type: 'line',
						label: `Best Weight (${unit})`,
						data: data.map(d => convertWeight(d.best_weight, unit)),
						borderColor: 'rgb(34,197,94)',
						backgroundColor: 'rgba(34,197,94,0.0)',
						tension: 0.3,
						pointRadius: 4,
						pointHoverRadius: 6,
						pointBackgroundColor: 'rgb(34,197,94)',
						borderWidth: 2,
						yAxisID: 'y',
						order: 1
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { mode: 'index', intersect: false },
				plugins: {
					legend: {
						position: 'top',
						align: 'end',
						labels: {
							usePointStyle: true,
							pointStyleWidth: 8,
							padding: 12,
							color: labelColor,
							font: { size: 11 }
						}
					},
					tooltip: {
						callbacks: {
							label: ctx => {
								const v = Math.round(ctx.parsed.y ?? 0);
								return `${ctx.dataset.label}: ${v.toLocaleString()}`;
							},
							afterBody: ctx => {
								const idx = ctx[0]?.dataIndex;
								if (idx == null) return [];
								const rpe = data[idx]?.avg_rpe;
								return rpe != null ? [`Avg RPE: ${rpe}`] : [];
							}
						}
					}
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: { color: tickColor, maxTicksLimit: 6, maxRotation: 0 }
					},
					y: {
						position: 'left',
						beginAtZero: false,
						grid: { color: gridColor },
						ticks: { color: tickColor, maxTicksLimit: 5 },
						title: { display: true, text: `Weight (${unit})`, color: labelColor, font: { size: 10 } }
					},
					y1: {
						position: 'right',
						display: false,
						grid: { drawOnChartArea: false }
					}
				}
			}
		});
	}

	$: if (canvas && data.length > 0) createChart();

	onMount(() => {
		if (data.length > 0) createChart();
		return () => { if (chart) chart.destroy(); };
	});
</script>

<Card class="p-4 sm:p-6">
	<h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
	<div class="h-56 sm:h-72">
		{#if data.length > 0}
			<canvas bind:this={canvas}></canvas>
		{:else}
			<div class="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
				Select an exercise to view progress
			</div>
		{/if}
	</div>
	{#if data.length > 0}
		{@const rpePoints = data.filter(d => d.avg_rpe != null)}
		{#if rpePoints.length > 0}
			{@const latestRpe = rpePoints[rpePoints.length - 1].avg_rpe}
			{@const avgRpe = rpePoints.reduce((s, d) => s + (d.avg_rpe ?? 0), 0) / rpePoints.length}
			<div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
				<span>RPE — latest: <span class="font-semibold text-gray-900 dark:text-white">{latestRpe}</span></span>
				<span>avg: <span class="font-semibold text-gray-900 dark:text-white">{avgRpe.toFixed(1)}</span></span>
				<span class="text-gray-400 dark:text-gray-600">({rpePoints.length}/{data.length} sessions tracked)</span>
			</div>
		{/if}
	{/if}
</Card>
