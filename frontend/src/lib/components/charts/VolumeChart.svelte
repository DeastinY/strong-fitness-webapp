<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables, type ChartConfiguration } from 'chart.js';
	import type { VolumeDataPoint } from '$lib/types';
	import type { Unit } from '$lib/types';
	import { convertWeight, formatDate } from '$lib/utils';
	import Card from '../ui/Card.svelte';

	export let data: VolumeDataPoint[];
	export let unit: Unit;
	export let title = 'Volume Over Time';

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	Chart.register(...registerables);

	function createChart() {
		if (chart) {
			chart.destroy();
		}

		const labels = data.map((d) => formatDate(d.date));
		const volumes = data.map((d) => convertWeight(d.volume, unit));

		const config: ChartConfiguration = {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: `Volume (${unit})`,
						data: volumes,
						borderColor: 'rgb(59, 130, 246)',
						backgroundColor: 'rgba(59, 130, 246, 0.1)',
						fill: true,
						tension: 0.3,
						pointRadius: 4,
						pointHoverRadius: 6
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						mode: 'index',
						intersect: false,
						callbacks: {
							label: (context) => {
								const value = context.parsed.y.toLocaleString();
								return `Volume: ${value} ${unit}`;
							}
						}
					}
				},
				scales: {
					x: {
						grid: {
							display: false
						}
					},
					y: {
						beginAtZero: true,
						ticks: {
							callback: (value) => {
								if (typeof value === 'number') {
									return value.toLocaleString();
								}
								return value;
							}
						}
					}
				},
				interaction: {
					mode: 'nearest',
					axis: 'x',
					intersect: false
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
				No data available
			</div>
		{/if}
	</div>
</Card>
