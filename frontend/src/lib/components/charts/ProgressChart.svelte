<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables, type ChartConfiguration } from 'chart.js';
	import type { ExerciseProgress } from '$lib/types';
	import type { Unit } from '$lib/types';
	import { convertWeight, formatDate } from '$lib/utils';
	import Card from '../ui/Card.svelte';

	export let data: ExerciseProgress[];
	export let unit: Unit;
	export let title = 'Exercise Progress';

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	Chart.register(...registerables);

	function createChart() {
		if (chart) {
			chart.destroy();
		}

		const labels = data.map((d) => formatDate(d.date));
		const weights = data.map((d) => convertWeight(d.best_weight, unit));
		const volumes = data.map((d) => convertWeight(d.total_volume, unit));

		const config: ChartConfiguration = {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: `Best Weight (${unit})`,
						data: weights,
						borderColor: 'rgb(34, 197, 94)',
						backgroundColor: 'rgba(34, 197, 94, 0.1)',
						yAxisID: 'y',
						tension: 0.3,
						pointRadius: 4
					},
					{
						label: `Total Volume (${unit})`,
						data: volumes,
						borderColor: 'rgb(59, 130, 246)',
						backgroundColor: 'rgba(59, 130, 246, 0.1)',
						yAxisID: 'y1',
						tension: 0.3,
						pointRadius: 4
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'index',
					intersect: false
				},
				plugins: {
					legend: {
						position: 'top'
					}
				},
				scales: {
					x: {
						grid: {
							display: false
						}
					},
					y: {
						type: 'linear',
						display: true,
						position: 'left',
						title: {
							display: true,
							text: `Weight (${unit})`
						}
					},
					y1: {
						type: 'linear',
						display: true,
						position: 'right',
						title: {
							display: true,
							text: `Volume (${unit})`
						},
						grid: {
							drawOnChartArea: false
						}
					}
				}
			}
		};

		chart = new Chart(canvas, config);
	}

	onMount(() => {
		if (data.length > 0) {
			createChart();
		}
		return () => {
			if (chart) {
				chart.destroy();
			}
		};
	});

	$: if (canvas && data.length > 0) {
		createChart();
	}
</script>

<Card class="p-6">
	<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
	<div class="h-64">
		{#if data.length > 0}
			<canvas bind:this={canvas}></canvas>
		{:else}
			<div class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
				Select an exercise to view progress
			</div>
		{/if}
	</div>
</Card>
