<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables, type ChartConfiguration } from 'chart.js';
	import type { CategoryVolume } from '$lib/types';
	import type { Unit } from '$lib/types';
	import { convertWeight, getCategoryColor } from '$lib/utils';
	import Card from '../ui/Card.svelte';

	export let data: CategoryVolume[];
	export let unit: Unit;
	export let title = 'Volume by Category';

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	Chart.register(...registerables);

	function createChart() {
		if (chart) {
			chart.destroy();
		}

		const labels = data.map((d) => d.category.charAt(0).toUpperCase() + d.category.slice(1));
		const volumes = data.map((d) => convertWeight(d.volume, unit));
		const colors = data.map((d) => getCategoryColor(d.category));

		const config: ChartConfiguration = {
			type: 'doughnut',
			data: {
				labels,
				datasets: [
					{
						data: volumes,
						backgroundColor: colors,
						borderWidth: 0,
						hoverOffset: 4
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'right',
						labels: {
							usePointStyle: true,
							padding: 16
						}
					},
					tooltip: {
						callbacks: {
							label: (context) => {
								const value = context.parsed.toLocaleString();
								const total = volumes.reduce((a, b) => a + b, 0);
								const percentage = ((context.parsed / total) * 100).toFixed(1);
								return `${context.label}: ${value} ${unit} (${percentage}%)`;
							}
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
	<h3 class="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
	<div class="h-64">
		{#if data.length > 0}
			<canvas bind:this={canvas}></canvas>
		{:else}
			<div class="h-full flex items-center justify-center text-gray-500">
				No data available
			</div>
		{/if}
	</div>
</Card>
