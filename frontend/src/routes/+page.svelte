<script lang="ts">
	import { onMount } from 'svelte';
	import type { KPIStats, VolumeDataPoint, CategoryVolume, WorkoutSummary, WorkoutWithSets, Unit } from '$lib/types';
	import { getKPIStats, getVolumeStats, getCategoryStats, getWorkouts, getWorkout } from '$lib/api';
	import { formatVolume, formatDuration } from '$lib/utils';
	import { getContextualTip, type Tip } from '$lib/tips';
	import KpiCard from '$lib/components/dashboard/KpiCard.svelte';
	import TipCard from '$lib/components/dashboard/TipCard.svelte';
	import WorkoutList from '$lib/components/dashboard/WorkoutList.svelte';
	import VolumeChart from '$lib/components/charts/VolumeChart.svelte';
	import MuscleGroupChart from '$lib/components/charts/MuscleGroupChart.svelte';
	import WorkoutCalendar from '$lib/components/dashboard/WorkoutCalendar.svelte';
	import ConsistencyScore from '$lib/components/dashboard/ConsistencyScore.svelte';
	import OneRMTrends from '$lib/components/charts/OneRMTrends.svelte';
	import LLMExport from '$lib/components/dashboard/LLMExport.svelte';
	import UnitToggle from '$lib/components/ui/UnitToggle.svelte';
	import { Activity, Flame, Dumbbell, Clock } from 'lucide-svelte';

	let unit: Unit = 'lbs';
	let kpi: KPIStats | null = null;
	let volumeData: VolumeDataPoint[] = [];
	let categoryData: CategoryVolume[] = [];
	let recentWorkouts: WorkoutSummary[] = [];
	let allWorkouts: WorkoutSummary[] = [];
	let workoutDetails: WorkoutWithSets[] = [];
	let tip: Tip | null = null;
	let loading = true;
	let error: string | null = null;

	async function loadData() {
		try {
			loading = true;
			error = null;
			const [kpiResult, volumeResult, categoryResult, workoutsResult, allWorkoutsResult] = await Promise.all([
				getKPIStats(),
				getVolumeStats(),
				getCategoryStats(),
				getWorkouts(0, 5),
				getWorkouts(0, 100)
			]);
			kpi = kpiResult;
			volumeData = volumeResult;
			categoryData = categoryResult;
			recentWorkouts = workoutsResult;
			allWorkouts = allWorkoutsResult;

			// Fetch workout details for 1RM trends (last 15 workouts)
			const detailsToFetch = allWorkoutsResult.slice(0, 15);
			workoutDetails = await Promise.all(detailsToFetch.map(w => getWorkout(w.id)));

			// Get contextual tip based on user stats
			tip = getContextualTip({
				totalWorkouts: kpiResult.total_workouts,
				streak: kpiResult.current_streak
			});
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
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
		<div class="flex items-center gap-3">
			{#if kpi}
				<LLMExport {kpi} {volumeData} {categoryData} {recentWorkouts} />
			{/if}
			<UnitToggle bind:unit />
		</div>
	</div>

	{#if loading}
		<div class="flex items-center justify-center h-64">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
		</div>
	{:else if error}
		<div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
			{error}
		</div>
	{:else if kpi}
		<!-- Tip of the Day -->
		{#if tip}
			<TipCard {tip} />
		{/if}

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

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2">
				<VolumeChart data={volumeData} {unit} title="Volume Trend" />
			</div>
			<ConsistencyScore workouts={allWorkouts} />
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<WorkoutCalendar workouts={allWorkouts} />
			<MuscleGroupChart data={categoryData} {unit} title="Volume by Muscle Group" />
		</div>

		<OneRMTrends {workoutDetails} />

		<WorkoutList workouts={recentWorkouts} {unit} />
	{/if}
</div>
