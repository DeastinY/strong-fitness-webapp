<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import type { WorkoutSummary, Unit } from '$lib/types';
	import Card from '../ui/Card.svelte';

	export let workouts: WorkoutSummary[];
	export let unit: Unit;

	Chart.register(...registerables);

	let freqCanvas: HTMLCanvasElement;
	let dowCanvas: HTMLCanvasElement;
	let durationCanvas: HTMLCanvasElement;
	let freqChart: Chart | null = null;
	let dowChart: Chart | null = null;
	let durationChart: Chart | null = null;

	const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	function getWeekStart(date: Date): string {
		const d = new Date(date);
		d.setDate(d.getDate() - d.getDay());
		d.setHours(0, 0, 0, 0);
		return d.toISOString().split('T')[0];
	}

	function buildWeeklyData() {
		const weekMap = new Map<string, number>();
		for (const w of workouts) {
			const key = getWeekStart(new Date(w.date));
			weekMap.set(key, (weekMap.get(key) ?? 0) + 1);
		}

		// Build last 16 weeks ending this week
		const weeks: { label: string; count: number }[] = [];
		const today = new Date();
		const currentWeekStart = new Date(today);
		currentWeekStart.setDate(today.getDate() - today.getDay());
		currentWeekStart.setHours(0, 0, 0, 0);

		for (let i = 15; i >= 0; i--) {
			const d = new Date(currentWeekStart);
			d.setDate(d.getDate() - i * 7);
			const key = d.toISOString().split('T')[0];
			const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			weeks.push({ label, count: weekMap.get(key) ?? 0 });
		}

		return weeks;
	}

	function buildDowData() {
		const counts = [0, 0, 0, 0, 0, 0, 0];
		for (const w of workouts) {
			counts[new Date(w.date).getDay()]++;
		}
		return counts;
	}

	function buildDurationData() {
		return [...workouts]
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
			.map(w => ({
				label: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
				duration: w.duration_minutes ?? 0
			}));
	}

	function colors(isDark: boolean) {
		return {
			grid: isDark ? 'rgba(75,85,99,0.3)' : 'rgba(0,0,0,0.08)',
			tick: isDark ? '#9ca3af' : '#6b7280',
			label: isDark ? '#d1d5db' : '#374151',
		};
	}

	function freqBarColor(count: number): string {
		if (count === 0) return 'rgba(156,163,175,0.25)';
		if (count === 1) return 'rgba(251,191,36,0.75)';
		if (count === 2) return 'rgba(251,191,36,0.95)';
		return 'rgba(34,197,94,0.85)';
	}

	function buildCharts() {
		const isDark = document.documentElement.classList.contains('dark');
		const c = colors(isDark);

		// --- Weekly frequency ---
		if (freqChart) freqChart.destroy();
		const weekly = buildWeeklyData();
		freqChart = new Chart(freqCanvas, {
			type: 'bar',
			data: {
				labels: weekly.map(w => w.label),
					datasets: [{
					label: 'Weekly sessions',
					data: weekly.map(w => w.count),
					backgroundColor: weekly.map(w => freqBarColor(w.count)),
					borderRadius: 4,
					borderSkipped: false,
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} session${ctx.parsed.y !== 1 ? 's' : ''} in this week` } }
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: { color: c.tick, maxTicksLimit: 8, maxRotation: 0, font: { size: 10 } }
					},
					y: {
						beginAtZero: true,
						max: 5,
						ticks: { color: c.tick, stepSize: 1 },
						grid: { color: c.grid }
					}
				}
			}
		});

		// --- Day of week ---
		if (dowChart) dowChart.destroy();
		const dowCounts = buildDowData();
		const maxDow = Math.max(...dowCounts, 1);
		dowChart = new Chart(dowCanvas, {
			type: 'bar',
			data: {
				labels: DOW_LABELS,
					datasets: [{
					label: 'Sessions by weekday',
					data: dowCounts,
					backgroundColor: dowCounts.map(n => {
						const alpha = 0.2 + 0.7 * (n / maxDow);
						return `rgba(59,130,246,${alpha.toFixed(2)})`;
					}),
					borderRadius: 4,
					borderSkipped: false,
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} session${ctx.parsed.y !== 1 ? 's' : ''} on this day` } }
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: { color: c.tick, font: { size: 11 } }
					},
					y: {
						beginAtZero: true,
						ticks: { color: c.tick, stepSize: 1 },
						grid: { color: c.grid }
					}
				}
			}
		});

		// --- Duration over time ---
		if (durationChart) durationChart.destroy();
		const durationData = buildDurationData();
		durationChart = new Chart(durationCanvas, {
			type: 'line',
			data: {
				labels: durationData.map(d => d.label),
					datasets: [{
					label: 'Session runtime (min)',
					data: durationData.map(d => d.duration),
					borderColor: 'rgb(168,85,247)',
					backgroundColor: 'rgba(168,85,247,0.08)',
					fill: true,
					tension: 0.3,
					pointRadius: 3,
					pointHoverRadius: 5,
					borderWidth: 2,
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} min runtime` } }
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: { color: c.tick, maxTicksLimit: 8, maxRotation: 0, font: { size: 10 } }
					},
					y: {
						beginAtZero: false,
						grid: { color: c.grid },
						ticks: { color: c.tick, callback: v => `${v}m` }
					}
				}
			}
		});
	}

	$: if (workouts.length > 0 && freqCanvas && dowCanvas && durationCanvas) buildCharts();

	onMount(() => {
		if (workouts.length > 0) buildCharts();
		return () => {
			freqChart?.destroy();
			dowChart?.destroy();
			durationChart?.destroy();
		};
	});
</script>

<div class="space-y-4">
	<div class="grid grid-cols-1 sm:grid-cols-5 gap-4">
		<!-- Weekly frequency -->
		<Card class="p-4 sm:col-span-3">
			<h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Weekly Rhythm</h3>
			<p class="text-xs text-gray-400 dark:text-gray-500 mb-3">Sessions per week across the last 16 scenes, tracked in {unit}</p>
			<div class="h-36 sm:h-44">
				<canvas bind:this={freqCanvas}></canvas>
			</div>
			<div class="flex items-center gap-3 mt-2 text-[10px] text-gray-400 dark:text-gray-500 flex-wrap">
				<span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-gray-200 dark:bg-gray-600"></span>0</span>
				<span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-amber-300"></span>1</span>
				<span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400"></span>2</span>
				<span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-green-500"></span>3+</span>
			</div>
		</Card>

		<!-- Day of week -->
		<Card class="p-4 sm:col-span-2">
			<h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Weekday Bias</h3>
			<p class="text-xs text-gray-400 dark:text-gray-500 mb-3">Where your sessions usually land</p>
			<div class="h-36 sm:h-44">
				<canvas bind:this={dowCanvas}></canvas>
			</div>
		</Card>
	</div>

	<!-- Duration over time -->
	<Card class="p-4">
		<h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Session Runtime Arc</h3>
		<p class="text-xs text-gray-400 dark:text-gray-500 mb-3">Minutes per session over your timeline</p>
		<div class="h-36 sm:h-44">
			<canvas bind:this={durationCanvas}></canvas>
		</div>
	</Card>
</div>
