<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import type { VolumeDataPoint } from '$lib/types';
	import type { Unit } from '$lib/types';
	import { convertWeight } from '$lib/utils';
	import Card from '../ui/Card.svelte';

	export let data: VolumeDataPoint[];
	export let unit: Unit;
	export let highlightFrom = '';
	export let highlightTo = '';

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	Chart.register(...registerables);

	function buildChart(d: VolumeDataPoint[], u: Unit, hFrom: string, hTo: string) {
		if (chart) { chart.destroy(); chart = null; }
		if (!d.length) return;

		// Aggregate by month: total volume + workout count
		const monthly: Record<string, { volume: number; count: number }> = {};
		for (const pt of d) {
			const key = pt.date.substring(0, 7); // "YYYY-MM"
			if (!monthly[key]) monthly[key] = { volume: 0, count: 0 };
			monthly[key].volume += pt.volume;
			monthly[key].count += 1;
		}
		const entries = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b));

		const labels = entries.map(([key]) => {
			const [y, m] = key.split('-').map(Number);
			return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
		});
		const volumes = entries.map(([, v]) => convertWeight(v.volume, u));
		const counts = entries.map(([, v]) => v.count);

		// Highlight months inside the selected date range
		const fromMonth = hFrom.substring(0, 7);
		const toMonth = hTo.substring(0, 7);
		const inRange = entries.map(([key]) => key >= fromMonth && key <= toMonth);

		const isDark = document.documentElement.classList.contains('dark');
		const gridColor = isDark ? 'rgba(75,85,99,0.3)' : 'rgba(0,0,0,0.08)';
		const tickColor = isDark ? '#9ca3af' : '#6b7280';
		const labelColor = isDark ? '#d1d5db' : '#374151';

		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: `Volume (${u})`,
						data: volumes,
						borderColor: inRange.map(r => r ? 'rgb(59,130,246)' : 'rgba(59,130,246,0.3)'),
						backgroundColor: 'rgba(59,130,246,0.08)',
						fill: true,
						tension: 0.3,
						pointRadius: inRange.map(r => r ? 4 : 2),
						pointHoverRadius: 6,
						pointBackgroundColor: inRange.map(r => r ? 'rgb(59,130,246)' : 'rgba(59,130,246,0.3)'),
						segment: {
							borderColor: (ctx) => {
								const i = ctx.p0DataIndex;
								return inRange[i] && inRange[i + 1]
									? 'rgb(59,130,246)'
									: 'rgba(59,130,246,0.3)';
							},
						},
						yAxisID: 'y',
						order: 2,
					},
					{
						label: 'Sessions',
						data: counts,
						borderColor: inRange.map(r => r ? 'rgb(34,197,94)' : 'rgba(34,197,94,0.3)'),
						backgroundColor: 'rgba(34,197,94,0)',
						tension: 0.3,
						pointRadius: inRange.map(r => r ? 4 : 2),
						pointHoverRadius: 6,
						pointBackgroundColor: inRange.map(r => r ? 'rgb(34,197,94)' : 'rgba(34,197,94,0.3)'),
						borderDash: [4, 3],
						segment: {
							borderColor: (ctx) => {
								const i = ctx.p0DataIndex;
								return inRange[i] && inRange[i + 1]
									? 'rgb(34,197,94)'
									: 'rgba(34,197,94,0.3)';
							},
						},
						yAxisID: 'y1',
						order: 1,
					},
				],
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
							pointStyleWidth: 10,
							padding: 12,
							color: labelColor,
							font: { size: 11 },
						},
					},
					tooltip: {
						callbacks: {
							label: (ctx) => {
								if (ctx.datasetIndex === 0)
									return `Volume: ${Math.round(ctx.parsed.y ?? 0).toLocaleString()} ${u}`;
								return `Sessions: ${ctx.parsed.y}`;
							},
						},
					},
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: { color: tickColor, maxRotation: 45, font: { size: 10 } },
					},
					y: {
						position: 'left',
						beginAtZero: true,
						grid: { color: gridColor },
						ticks: {
							color: tickColor,
							callback: (v) => (typeof v === 'number' ? v.toLocaleString() : v),
						},
						title: { display: true, text: `Volume (${u})`, color: labelColor, font: { size: 10 } },
					},
					y1: {
						position: 'right',
						beginAtZero: true,
						grid: { drawOnChartArea: false },
						ticks: { color: 'rgb(34,197,94)', stepSize: 1 },
						title: { display: true, text: 'Sessions', color: 'rgb(34,197,94)', font: { size: 10 } },
					},
				},
			},
		});
	}

	$: if (canvas) buildChart(data, unit, highlightFrom, highlightTo);

	onMount(() => {
		buildChart(data, unit, highlightFrom, highlightTo);
		return () => { if (chart) chart.destroy(); };
	});
</script>

<Card class="p-4 sm:p-6">
	<div class="flex items-center justify-between mb-3">
		<h3 class="text-base font-semibold text-gray-900 dark:text-white">Monthly Load — All Time</h3>
		{#if highlightFrom && highlightTo}
			<div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
				<span class="flex items-center gap-1.5">
					<span class="w-3 h-0.5 inline-block bg-blue-500 rounded"></span> Selected
				</span>
				<span class="flex items-center gap-1.5">
					<span class="w-3 h-0.5 inline-block bg-blue-300 rounded"></span> Other
				</span>
			</div>
		{/if}
	</div>
	<div class="h-48 sm:h-56">
		{#if data.length > 0}
			<canvas bind:this={canvas}></canvas>
		{:else}
			<div class="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
				No data
			</div>
		{/if}
	</div>
</Card>
