<script lang="ts">
	import { onMount } from 'svelte';
	import type { KPIStats, VolumeDataPoint, CategoryVolume, WorkoutSummary, Unit } from '$lib/types';
	import { getKPIStats, getVolumeStats, getCategoryStats, getWorkouts } from '$lib/api';
	import { formatVolume, formatDuration } from '$lib/utils';
	import KpiCard from '$lib/components/dashboard/KpiCard.svelte';
	import WorkoutList from '$lib/components/dashboard/WorkoutList.svelte';
	import VolumeChart from '$lib/components/charts/VolumeChart.svelte';
	import ExerciseChart from '$lib/components/charts/ExerciseChart.svelte';
	import UnitToggle from '$lib/components/ui/UnitToggle.svelte';
	import { Activity, Flame, Dumbbell, Clock } from 'lucide-svelte';

	let unit: Unit = 'lbs';
	let kpi: KPIStats | null = null;
	let volumeData: VolumeDataPoint[] = [];
	let categoryData: CategoryVolume[] = [];
	let recentWorkouts: WorkoutSummary[] = [];
	let loading = true;
	let error: string | null = null;

	async function loadData() {
		try {
			loading = true;
			error = null;
			const [kpiResult, volumeResult, categoryResult, workoutsResult] = await Promise.all([
				getKPIStats(),
				getVolumeStats(),
				getCategoryStats(),
				getWorkouts(0, 5)
			]);
			kpi = kpiResult;
			volumeData = volumeResult;
			categoryData = categoryResult;
			recentWorkouts = workoutsResult;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load data';
			console.error(e);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadData();
	});
</script>

<svelte:head>
	<title>Dashboard - Fitness Tracker</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
		<UnitToggle bind:unit />
	</div>

	{#if loading}
		<div class="flex items-center justify-center h-64">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
			{error}
		</div>
	{:else if kpi}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<KpiCard
				title="Total Workouts"
				value={kpi.total_workouts}
				icon={Activity}
			/>
			<KpiCard
				title="Week Streak"
				value={kpi.current_streak}
				subtitle="consecutive weeks"
				icon={Flame}
			/>
			<KpiCard
				title="Total Volume"
				value="{formatVolume(kpi.total_volume, unit)} {unit}"
				icon={Dumbbell}
			/>
			<KpiCard
				title="Avg Duration"
				value={formatDuration(kpi.avg_duration)}
				subtitle="per workout"
				icon={Clock}
			/>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<VolumeChart data={volumeData} {unit} title="Volume Trend" />
			<ExerciseChart data={categoryData} {unit} title="Volume by Category" />
		</div>

		<WorkoutList workouts={recentWorkouts} {unit} />
	{/if}
</div>
