<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import type { CardioDataPoint } from '$lib/types';
	import Card from '../ui/Card.svelte';

	export let data: CardioDataPoint[];

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
			type: 'line',
			data: {
				labels: data.map(d => shortDate(d.date)),
				datasets: [
					{
						label: 'Distance (km)',
						data: data.map(d => d.distance_km),
						borderColor: 'rgb(14,165,233)',
						backgroundColor: isDark ? 'rgba(14,165,233,0.12)' : 'rgba(14,165,233,0.08)',
						fill: true,
						tension: 0.3,
						pointRadius: 3,
						pointHoverRadius: 5,
						pointBackgroundColor: 'rgb(14,165,233)',
						borderWidth: 2,
						yAxisID: 'y'
					},
					{
						label: 'Duration (min)',
						data: data.map(d => Math.round(d.seconds / 60)),
						borderColor: 'rgb(168,85,247)',
						backgroundColor: 'rgba(168,85,247,0.0)',
						fill: false,
						tension: 0.3,
						pointRadius: 3,
						pointHoverRadius: 5,
						pointBackgroundColor: 'rgb(168,85,247)',
						borderWidth: 2,
						borderDash: [4, 3],
						yAxisID: 'y1'
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
								if (ctx.datasetIndex === 0) return `Distance: ${(ctx.parsed.y ?? 0).toFixed(2)} km`;
								return `Duration: ${ctx.parsed.y ?? 0} min`;
							}
						}
					}
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: { color: tickColor, maxTicksLimit: 8, maxRotation: 0 }
					},
					y: {
						position: 'left',
						beginAtZero: false,
						grid: { color: gridColor },
						ticks: { color: tickColor, maxTicksLimit: 5 },
						title: { display: true, text: 'km', color: labelColor, font: { size: 10 } }
					},
					y1: {
						position: 'right',
						beginAtZero: false,
						grid: { drawOnChartArea: false },
						ticks: { color: tickColor, maxTicksLimit: 5 },
						title: { display: true, text: 'min', color: labelColor, font: { size: 10 } }
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
	<h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">Cardio</h3>
	<div class="h-48 sm:h-56">
		{#if data.length > 0}
			<canvas bind:this={canvas}></canvas>
		{:else}
			<div class="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
				No cardio data found
			</div>
		{/if}
	</div>
	{#if data.length > 0}
		{@const totalKm = data.reduce((s, d) => s + d.distance_km, 0)}
		{@const avgKm = totalKm / data.length}
		{@const avgMin = Math.round(data.reduce((s, d) => s + d.seconds, 0) / data.length / 60)}
		<div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
			<span>Sessions: <span class="font-semibold text-gray-900 dark:text-white">{data.length}</span></span>
			<span>Avg distance: <span class="font-semibold text-gray-900 dark:text-white">{avgKm.toFixed(2)} km</span></span>
			<span>Avg duration: <span class="font-semibold text-gray-900 dark:text-white">{avgMin} min</span></span>
		</div>
	{/if}
</Card>
