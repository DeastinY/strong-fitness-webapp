<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import type { ReportSession } from '$lib/types';
	import type { Unit } from '$lib/types';
	import { convertWeight } from '$lib/utils';
	import Card from '../ui/Card.svelte';

	export let sessions: ReportSession[];
	export let unit: Unit;

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	Chart.register(...registerables);

	function buildChart(sess: ReportSession[], u: Unit) {
		if (chart) { chart.destroy(); chart = null; }

		const strSessions = sess.filter(s => s.sets.some(ss => ss.weight_lbs != null && ss.reps != null));
		if (strSessions.length < 2) return;

		const isDark = document.documentElement.classList.contains('dark');
		const gridColor = isDark ? 'rgba(75,85,99,0.3)' : 'rgba(0,0,0,0.08)';
		const tickColor = isDark ? '#9ca3af' : '#6b7280';
		const labelColor = isDark ? '#d1d5db' : '#374151';

		const labels = strSessions.map(s =>
			new Date(s.date.split('T')[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
		);

		// Aggregate per session: total reps and total volume
		const totalReps = strSessions.map(s =>
			s.sets.reduce((sum, ss) => sum + (ss.reps ?? 0), 0)
		);
		const totalVolume = strSessions.map(s =>
			convertWeight(
				s.sets.reduce((sum, ss) =>
					sum + (ss.weight_lbs != null && ss.reps != null ? ss.weight_lbs * ss.reps : 0), 0),
				u
			)
		);

		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels,
					datasets: [
					{
						label: `Session load (${u})`,
						data: totalVolume,
						borderColor: 'rgb(59,130,246)',
						backgroundColor: 'rgba(59,130,246,0.1)',
						fill: true,
						tension: 0.3,
						pointRadius: 4,
						pointHoverRadius: 6,
						yAxisID: 'y',
						order: 2,
					},
					{
						label: 'Rep count',
						data: totalReps,
						borderColor: 'rgb(34,197,94)',
						backgroundColor: 'rgba(34,197,94,0)',
						tension: 0.3,
						pointRadius: 4,
						pointHoverRadius: 6,
						borderDash: [4, 3],
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
								const si = ctx.dataIndex;
								const sets = strSessions[si].sets;
								const v = Math.round(ctx.parsed.y ?? 0).toLocaleString();
								if (ctx.datasetIndex === 0) {
									// Volume breakdown: "1,160 lbs (5×100 + 5×100 + 2×80)"
									const parts = sets
										.filter(s => s.weight_lbs != null && s.reps != null)
										.map(s => `${Math.round(s.reps!)}×${Math.round(convertWeight(s.weight_lbs!, u))}`);
									const breakdown = parts.length > 1 ? ` (${parts.join(' + ')})` : '';
									return `Session load: ${v} ${u}${breakdown}`;
								}
								// Reps breakdown: "12 (5+5+2)"
								const parts = sets
									.filter(s => s.reps != null)
									.map(s => Math.round(s.reps!));
								const breakdown = parts.length > 1 ? ` (${parts.join('+')})` : '';
								return `Rep count: ${v}${breakdown}`;
							},
						},
					},
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: { color: tickColor, maxRotation: 0, maxTicksLimit: 8 },
					},
					y: {
						position: 'left',
						beginAtZero: false,
						grid: { color: gridColor },
						ticks: {
							color: tickColor,
							callback: (v) => (typeof v === 'number' ? v.toLocaleString() : v),
						},
						title: { display: true, text: `Session load (${u})`, color: labelColor, font: { size: 10 } },
					},
					y1: {
						position: 'right',
						beginAtZero: false,
						grid: { drawOnChartArea: false },
						ticks: { color: 'rgb(34,197,94)' },
						title: { display: true, text: 'Rep count', color: 'rgb(34,197,94)', font: { size: 10 } },
					},
				},
			},
		});
	}

	$: if (canvas) buildChart(sessions, unit);

	onMount(() => {
		buildChart(sessions, unit);
		return () => { if (chart) chart.destroy(); };
	});
</script>

<Card class="p-4 sm:p-6">
	<h3 class="text-base font-semibold text-gray-900 dark:text-white mb-3">Rep Count and Load per Session</h3>
	<div class="h-56 sm:h-64">
		<canvas bind:this={canvas}></canvas>
	</div>
</Card>
