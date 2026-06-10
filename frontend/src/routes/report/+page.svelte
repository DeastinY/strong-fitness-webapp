<script lang="ts">
	import { onMount } from 'svelte';
	import { getReport, getAllVolumeStats } from '$lib/api';
	import type { ReportData, ReportSession, ReportSet, VolumeDataPoint } from '$lib/types';
	import type { Unit } from '$lib/types';
	import { convertWeight, formatWeight, formatVolume, formatDate, formatDuration } from '$lib/utils';
	import ProgressChart from '$lib/components/charts/ProgressChart.svelte';
	import ReportSetChart from '$lib/components/charts/ReportSetChart.svelte';
	import MonthlyVolumeChart from '$lib/components/charts/MonthlyVolumeChart.svelte';
	import { Printer, Loader } from 'lucide-svelte';

	let report: ReportData | null = null;
	let allVolumeData: VolumeDataPoint[] = [];
	let loading = false;
	let error = '';
	let unit: Unit = 'lbs';
	let dateFrom = '';
	let dateTo = '';

	function isoDate(d: Date) {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}

	// Strip time component from backend datetime strings like "2026-01-30T18:17:12"
	function dateOnly(s: string) { return s.split('T')[0]; }

	async function loadReport() {
		if (!dateFrom || !dateTo || dateFrom > dateTo) return;
		loading = true; error = '';
		try { report = await getReport(dateFrom, dateTo); }
		catch { error = 'Failed to load report data. Make sure the backend is running.'; }
		finally { loading = false; }
	}

	onMount(async () => {
		const today = new Date();
		// First day of the month 2 months ago → gives exactly 3 calendar months
		const start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
		dateTo = isoDate(today);
		dateFrom = isoDate(start);
		[allVolumeData] = await Promise.all([getAllVolumeStats(), loadReport()]);
	});

	function shortDate(s: string) {
		return new Date(dateOnly(s)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function getCategoryLabel(c: string | null) {
		return c ? c.charAt(0).toUpperCase() + c.slice(1) : 'Other';
	}
	function getCategoryClass(c: string | null) {
		const m: Record<string, string> = {
			legs: 'bg-red-100 text-red-700', back: 'bg-blue-100 text-blue-700',
			shoulders: 'bg-green-100 text-green-700', core: 'bg-purple-100 text-purple-700',
			chest: 'bg-orange-100 text-orange-700', arms: 'bg-pink-100 text-pink-700',
			cardio: 'bg-yellow-100 text-yellow-700',
		};
		return m[c || ''] || 'bg-gray-100 text-gray-700';
	}

	function formatSet(s: ReportSet, u: Unit): string {
		if (s.weight_lbs != null && s.reps != null)
			return `${Math.round(s.reps)} × ${formatWeight(s.weight_lbs, u)}`;
		if (s.reps != null) return `${Math.round(s.reps)} reps`;
		if (s.distance != null) {
			const km = s.distance.toFixed(1);
			if (s.seconds != null) {
				const m = Math.floor(s.seconds / 60), ss = String(Math.round(s.seconds % 60)).padStart(2, '0');
				return `${km} km / ${m}:${ss}`;
			}
			return `${km} km`;
		}
		return '—';
	}

	function sessionBestWeight(sets: ReportSet[]): number {
		return sets.reduce((max, s) => s.weight_lbs != null ? Math.max(max, s.weight_lbs) : max, 0);
	}

	function sessionStats(sessions: ReportSession[], si: number) {
		const curr = sessionBestWeight(sessions[si].sets);
		const prev = si > 0 ? sessionBestWeight(sessions[si - 1].sets) : null;
		const delta = prev != null && curr > 0 ? curr - prev : null;
		return { curr, delta, improved: delta != null && delta > 0 };
	}

	// Build monthly calendar grids (Mon-based)
	function buildMonthlyCalendars(rawFrom: string, rawTo: string, workoutDates: string[]) {
		const workoutSet = new Set(workoutDates);
		// rawFrom/rawTo may be full datetime strings — take date part only
		const [fy, fm, fd] = dateOnly(rawFrom).split('-').map(Number);
		const [ty, tm, td] = dateOnly(rawTo).split('-').map(Number);
		const from = new Date(fy, fm - 1, fd);
		const to = new Date(ty, tm - 1, td);

		type Cell = { day: number; inMonth: boolean; hasWorkout: boolean };
		const months: Array<{ label: string; cells: Cell[] }> = [];
		let cur = new Date(from.getFullYear(), from.getMonth(), 1);
		const end = new Date(to.getFullYear(), to.getMonth(), 1);

		while (cur <= end) {
			const y = cur.getFullYear(), m = cur.getMonth();
			const label = cur.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
			const firstDay = new Date(y, m, 1);
			const lastDay = new Date(y, m + 1, 0);
			const pad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Mon-based
			const cells: Cell[] = [];
			let d = new Date(y, m, 1 - pad);
			while (d <= lastDay || cells.length % 7 !== 0) {
				cells.push({
					day: d.getDate(),
					inMonth: d.getMonth() === m && d.getFullYear() === y,
					hasWorkout: workoutSet.has(isoDate(d)),
				});
				d.setDate(d.getDate() + 1);
			}
			months.push({ label, cells });
			cur.setMonth(cur.getMonth() + 1);
		}
		return months;
	}

	$: monthlyCalendars = report
		? buildMonthlyCalendars(report.date_from, report.date_to, report.attendance.workout_dates)
		: [];
	$: maxDow = report ? Math.max(...report.attendance.day_of_week.map(d => d.count), 1) : 1;
</script>

<svelte:head>
	<style>
		@media print {
			nav { display: none !important; }
			.no-print { display: none !important; }
			.print-break { page-break-before: always; }
			body { background: white !important; color: black !important; }
			* { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
		}
	</style>
</svelte:head>

<div class="stage-stack space-y-6">

<!-- Controls bar (hidden in print) -->
<div class="no-print mb-6 flex flex-wrap items-center gap-3">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white flex-1 min-w-0">Narrative Report Studio</h1>

	<div class="flex items-center gap-2 text-sm">
		<label for="report-from" class="text-gray-500 dark:text-gray-400 shrink-0">From</label>
		<input id="report-from" type="date" bind:value={dateFrom} on:change={loadReport}
			class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2.5 py-1.5 text-sm" />
		<span class="text-gray-400">→</span>
		<input id="report-to" type="date" bind:value={dateTo} on:change={loadReport}
			class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2.5 py-1.5 text-sm" />
	</div>

	<div class="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
		<button class="px-3 py-1.5 font-medium transition-colors {unit === 'lbs' ? 'bg-orange-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}" on:click={() => (unit = 'lbs')}>lbs</button>
		<button class="px-3 py-1.5 font-medium transition-colors {unit === 'kg' ? 'bg-orange-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}" on:click={() => (unit = 'kg')}>kg</button>
	</div>

	<button on:click={() => window.print()}
		class="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
		<Printer class="w-4 h-4" /> Print / Save Story PDF
	</button>
</div>

{#if loading}
	<div class="flex items-center justify-center h-64 gap-3 text-gray-500 dark:text-gray-400">
		<Loader class="w-6 h-6 animate-spin" /><span>Building report…</span>
	</div>
{:else if error}
	<div class="text-red-600 dark:text-red-400 text-center py-12">{error}</div>
{:else if report}

<!-- ══════════════════════════════════════════════════ -->
<!-- OVERVIEW                                          -->
<!-- ══════════════════════════════════════════════════ -->

<div>
	<!-- Print header -->
	<div class="mb-8 pb-5 border-b-2 border-gray-200 flex items-start justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Performance Story Report</h1>
			<p class="text-lg text-gray-500 mt-1">{shortDate(report.date_from)} — {shortDate(report.date_to)}</p>
		</div>
		<div class="text-right text-sm text-gray-400">Generated {formatDate(report.generated_at)}</div>
	</div>

	<!-- Summary stats -->
	<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Executive Snapshot</h2>
	<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
		{#each [
			{ value: String(report.overview.total_workouts), label: 'Total sessions staged' },
			{ value: String(report.overview.avg_workouts_per_week), label: 'Sessions per week' },
			{ value: formatDuration(report.overview.avg_duration_minutes), label: 'Average runtime' },
			{ value: convertWeight(report.overview.total_volume_lbs, unit).toLocaleString(), label: `Total load (${unit})` },
			{ value: String(report.overview.total_sets), label: 'Total sets logged' },
			{ value: String(report.overview.unique_exercises), label: 'Unique lifts' },
		] as stat}
			<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
				<div class="text-3xl font-bold text-blue-600">{stat.value}</div>
				<div class="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
			</div>
		{/each}
	</div>

	<!-- All-time monthly load chart -->
	<div class="mb-8">
		<MonthlyVolumeChart data={allVolumeData} {unit} highlightFrom={dateFrom} highlightTo={dateTo} />
	</div>

	<!-- Attendance calendars -->
	<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Attendance Cadence</h2>
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
		{#each monthlyCalendars as cal}
			{@const count = cal.cells.filter(c => c.inMonth && c.hasWorkout).length}
			<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
				<h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center mb-2">{cal.label}</h3>
				<div class="grid grid-cols-7 mb-1">
					{#each ['M','T','W','T','F','S','S'] as d}
						<div class="text-center text-xs text-gray-400 font-medium py-0.5">{d}</div>
					{/each}
				</div>
				<div class="grid grid-cols-7 gap-px">
					{#each cal.cells as cell}
						<div class="aspect-square flex items-center justify-center rounded text-xs
							{!cell.inMonth ? 'text-gray-200 dark:text-gray-700' :
							 cell.hasWorkout ? 'bg-blue-500 text-white font-semibold' :
							 'text-gray-600 dark:text-gray-400'}">
							{cell.inMonth ? cell.day : ''}
						</div>
					{/each}
				</div>
				<p class="mt-2 text-xs text-center text-gray-400 dark:text-gray-500">
					{count} session{count !== 1 ? 's' : ''}
				</p>
			</div>
		{/each}
	</div>

	<!-- Monthly + Day-of-week -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
		<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
			<h3 class="font-semibold text-gray-900 dark:text-white mb-3">Sessions by Month</h3>
			<table class="w-full text-sm">
				<thead><tr class="border-b border-gray-100 dark:border-gray-700">
					<th class="text-left py-1.5 font-medium text-gray-500 dark:text-gray-400">Month</th>
					<th class="text-right py-1.5 font-medium text-gray-500 dark:text-gray-400">Sessions</th>
				</tr></thead>
				<tbody>
					{#each report.attendance.monthly_breakdown as month}
						<tr class="border-b border-gray-50 dark:border-gray-700/50">
							<td class="py-2 text-gray-900 dark:text-white">{month.label}</td>
							<td class="py-2 text-right font-semibold text-blue-600">{month.count}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
			<h3 class="font-semibold text-gray-900 dark:text-white mb-3">Preferred Stage Days</h3>
			<div class="space-y-2">
				{#each report.attendance.day_of_week as dow}
					<div class="flex items-center gap-2">
						<span class="w-8 text-xs text-gray-500 dark:text-gray-400 shrink-0">{dow.day}</span>
						<div class="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-5">
							<div class="bg-blue-500 h-5 rounded-full" style="width:{maxDow > 0 ? (dow.count/maxDow)*100 : 0}%"></div>
						</div>
						<span class="w-5 text-xs font-semibold text-gray-700 dark:text-gray-300 text-right shrink-0">{dow.count}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<!-- ══════════════════════════════════════════════════ -->
<!-- EXERCISE SECTIONS                                 -->
<!-- ══════════════════════════════════════════════════ -->

{#each report.exercises as exercise}
	{@const maxSets = Math.max(0, ...exercise.sessions.map(s => s.sets.length))}
	{@const setIndices = Array.from({length: maxSets}, (_, i) => i)}
	<div class="print-break mt-12 print:mt-0">

		<!-- Header -->
		<div class="flex items-center justify-between mb-5 pb-4 border-b-2 border-gray-200">
			<div class="flex items-center gap-3">
				<h2 class="text-2xl font-bold text-gray-900 dark:text-white">{exercise.name}</h2>
				<span class="px-2.5 py-0.5 rounded-full text-xs font-medium {getCategoryClass(exercise.category)}">
					{getCategoryLabel(exercise.category)}
				</span>
			</div>
			<div class="text-sm text-gray-500 dark:text-gray-400">
				{exercise.sessions.length} session{exercise.sessions.length !== 1 ? 's' : ''}
			</div>
		</div>

		<!-- PRs -->
		{#if exercise.pr.best_weight > 0}
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
				<div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 p-3 text-center">
					<div class="text-xl font-bold text-blue-700 dark:text-blue-400">{formatWeight(exercise.pr.best_weight, unit)}</div>
					<div class="text-xs text-blue-600 dark:text-blue-500 mt-0.5">Peak load</div>
				</div>
				<div class="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 p-3 text-center">
					<div class="text-xl font-bold text-green-700 dark:text-green-400">{formatWeight(exercise.pr.best_estimated_1rm, unit)}</div>
					<div class="text-xs text-green-600 dark:text-green-500 mt-0.5">Projected 1RM</div>
				</div>
				<div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800 p-3 text-center">
					<div class="text-xl font-bold text-purple-700 dark:text-purple-400">{Math.round(exercise.pr.best_reps)}</div>
					<div class="text-xs text-purple-600 dark:text-purple-500 mt-0.5">Rep peak</div>
				</div>
				<div class="bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800 p-3 text-center">
					<div class="text-xl font-bold text-orange-700 dark:text-orange-400">{formatVolume(exercise.pr.best_volume, unit)}</div>
					<div class="text-xs text-orange-600 dark:text-orange-500 mt-0.5">Top-set volume ({unit})</div>
				</div>
			</div>
		{/if}

		<!-- Charts -->
		{#if exercise.progress.length >= 2}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
				<ProgressChart data={exercise.progress} {unit} title="Top Load and Session Volume" />
				<ReportSetChart sessions={exercise.sessions} {unit} />
			</div>
		{/if}

		<!-- Session × set table -->
		<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
			<table class="w-full text-sm whitespace-nowrap">
				<thead class="bg-gray-50 dark:bg-gray-700/50">
					<tr>
						<th class="text-left px-3 py-2.5 font-medium text-gray-500 dark:text-gray-400">Date</th>
						{#each setIndices as i}
							<th class="text-center px-3 py-2.5 font-medium text-gray-500 dark:text-gray-400">Set {i + 1}</th>
						{/each}
						<th class="text-right px-3 py-2.5 font-medium text-gray-500 dark:text-gray-400">Δ weight</th>
					</tr>
				</thead>
				<tbody>
					{#each exercise.sessions as session, si}
						{@const stats = sessionStats(exercise.sessions, si)}
						<tr class="border-t border-gray-100 dark:border-gray-700/50
							{stats.improved ? 'bg-green-50 dark:bg-green-900/10' : si % 2 !== 0 ? 'bg-gray-50/50 dark:bg-gray-700/20' : ''}">
							<!-- Date + trend arrow -->
							<td class="px-3 py-2.5 font-medium text-gray-900 dark:text-white">
								<span>{shortDate(session.date)}</span>
								{#if stats.improved}<span class="ml-1 text-green-600 text-xs font-bold">↑</span>{/if}
							</td>
							<!-- One column per set -->
							{#each setIndices as i}
								{@const s = session.sets[i]}
								{#if s}
									<td class="px-3 py-2.5 text-center font-mono text-xs
										{s.set_order === 'F'
											? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-semibold'
											: 'text-gray-800 dark:text-gray-200'}">
										{formatSet(s, unit)}{s.set_order === 'F' ? ' ✗' : ''}
									</td>
								{:else}
									<td class="px-3 py-2.5 text-center text-gray-300 dark:text-gray-600">—</td>
								{/if}
							{/each}
							<!-- Delta -->
							<td class="px-3 py-2.5 text-right text-xs font-medium
								{stats.delta != null && stats.delta > 0 ? 'text-green-600 dark:text-green-400' :
								 stats.delta != null && stats.delta < 0 ? 'text-red-500 dark:text-red-400' :
								 'text-gray-400 dark:text-gray-500'}">
								{#if stats.delta != null && stats.delta !== 0}
									{stats.delta > 0 ? '+' : ''}{formatWeight(Math.abs(stats.delta), unit)}
								{:else}—{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/each}

{/if}

</div>
