<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import type { WorkoutWithSets, Unit } from '$lib/types';
	import { convertWeight } from '$lib/utils';
	import Card from '../ui/Card.svelte';

	export let workoutDetails: WorkoutWithSets[];
	export let unit: Unit;

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	Chart.register(...registerables);

	const CATEGORIES = ['legs', 'back', 'shoulders', 'chest', 'arms', 'core'];

	const COLORS: Record<string, string> = {
		legs:      'rgb(239,68,68)',
		back:      'rgb(59,130,246)',
		shoulders: 'rgb(34,197,94)',
		chest:     'rgb(249,115,22)',
		arms:      'rgb(236,72,153)',
		core:      'rgb(168,85,247)',
	};

	function monthKey(dateStr: string): string {
		const d = new Date(dateStr);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
	}

	function monthLabel(key: string): string {
		const [year, month] = key.split('-');
		return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
	}

	function computeTrend(): { months: string[]; series: Record<string, number[]> } {
		const monthVol: Record<string, Record<string, number>> = {};

		for (const w of workoutDetails) {
			const mk = monthKey(w.date);
			if (!monthVol[mk]) monthVol[mk] = {};
			for (const s of w.sets) {
				const cat = s.exercise?.category;
				if (!cat || cat === 'cardio') continue;
				const vol = (s.weight_lbs ?? 0) * (s.reps ?? 0);
				monthVol[mk][cat] = (monthVol[mk][cat] ?? 0) + vol;
			}
		}

		const months = Object.keys(monthVol).sort();
		const activeCats = CATEGORIES.filter(c => months.some(m => (monthVol[m][c] ?? 0) > 0));

		const series: Record<string, number[]> = {};
		for (const cat of activeCats) {
			series[cat] = months.map(m => convertWeight(monthVol[m][cat] ?? 0, unit));
		}

		return { months, series };
	}

	function createChart() {
		if (chart) chart.destroy();

		const isDark = document.documentElement.classList.contains('dark');
		const gridColor = isDark ? 'rgba(75,85,99,0.3)' : 'rgba(0,0,0,0.08)';
		const tickColor = isDark ? '#9ca3af' : '#6b7280';
		const labelColor = isDark ? '#d1d5db' : '#374151';

		const { months, series } = computeTrend();

		if (months.length === 0) return;

		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels: months.map(monthLabel),
				datasets: Object.entries(series).map(([cat, values]) => ({
					label: cat.charAt(0).toUpperCase() + cat.slice(1),
					data: values,
					borderColor: COLORS[cat] ?? 'rgb(156,163,175)',
					backgroundColor: 'transparent',
					tension: 0.3,
					pointRadius: 3,
					pointHoverRadius: 5,
					borderWidth: 2,
				}))
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
							padding: 10,
							color: labelColor,
							font: { size: 11 }
						}
					},
					tooltip: {
						callbacks: {
							label: ctx => `${ctx.dataset.label}: ${Math.round(ctx.parsed.y ?? 0).toLocaleString()} ${unit}`
						}
					}
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: { color: tickColor, maxRotation: 0 }
					},
					y: {
						beginAtZero: true,
						grid: { color: gridColor },
						ticks: {
							color: tickColor,
							maxTicksLimit: 5,
							callback: v => `${Math.round(Number(v)).toLocaleString()}`
						},
						title: { display: true, text: `Volume (${unit})`, color: labelColor, font: { size: 10 } }
					}
				}
			}
		});
	}

	$: if (canvas && workoutDetails.length > 0) createChart();

	onMount(() => {
		if (workoutDetails.length > 0) createChart();
		return () => { if (chart) chart.destroy(); };
	});
</script>

<Card class="p-4 sm:p-6">
	<h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">Volume by Muscle Group (Monthly)</h3>
	<div class="h-56 sm:h-72">
		{#if workoutDetails.length > 0}
			<canvas bind:this={canvas}></canvas>
		{:else}
			<div class="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
				No data available
			</div>
		{/if}
	</div>
</Card>
