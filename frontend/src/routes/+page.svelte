<script lang="ts">
	import { onMount } from 'svelte';
	import type { KPIStats, VolumeDataPoint, CategoryVolume, CardioDataPoint, WorkoutSummary, WorkoutWithSets, Unit } from '$lib/types';
	import { getKPIStats, getVolumeStats, getCategoryStats, getCardioStats, getWorkouts, getWorkout } from '$lib/api';
	import { formatVolume, formatDuration } from '$lib/utils';
	import { yearFilter } from '$lib/stores/yearFilter';
	import KpiCard from '$lib/components/dashboard/KpiCard.svelte';
	import VolumeChart from '$lib/components/charts/VolumeChart.svelte';
	import MuscleGroupChart from '$lib/components/charts/MuscleGroupChart.svelte';
	import MuscleGroupTrendChart from '$lib/components/charts/MuscleGroupTrendChart.svelte';
	import CardioChart from '$lib/components/charts/CardioChart.svelte';
	import WorkoutCalendar from '$lib/components/dashboard/WorkoutCalendar.svelte';
	import ConsistencyScore from '$lib/components/dashboard/ConsistencyScore.svelte';
	import LLMExport from '$lib/components/dashboard/LLMExport.svelte';
	import UnitToggle from '$lib/components/ui/UnitToggle.svelte';
	import YearFilter from '$lib/components/ui/YearFilter.svelte';
	import { Activity, Flame, Dumbbell, Clock } from 'lucide-svelte';

	let unit: Unit = 'lbs';
	let kpi: KPIStats | null = null;
	let volumeData: VolumeDataPoint[] = [];
	let categoryData: CategoryVolume[] = [];
	let cardioData: CardioDataPoint[] = [];
	let allWorkouts: WorkoutSummary[] = [];
	let workoutDetails: WorkoutWithSets[] = [];
	let loading = true;
	let error: string | null = null;

	async function loadData() {
		try {
			loading = true;
			error = null;
			const [kpiResult, volumeResult, categoryResult, cardioResult, allWorkoutsResult] = await Promise.all([
				getKPIStats(),
				getVolumeStats(),
				getCategoryStats(),
				getCardioStats(),
				getWorkouts(0, 100)
			]);
			kpi = kpiResult;
			volumeData = volumeResult;
			categoryData = categoryResult;
			cardioData = cardioResult;
			allWorkouts = allWorkoutsResult;

			// Fetch workout details for muscle group progress and trend chart
			const detailsToFetch = allWorkoutsResult.slice(0, 60);
			workoutDetails = await Promise.all(detailsToFetch.map(w => getWorkout(w.id)));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load data';
			console.error(e);
		} finally {
			loading = false;
		}
	}

	let initialized = false;
	onMount(() => {
		loadData();
		initialized = true;
	});

	$: if (initialized) $yearFilter, loadData();
</script>

<svelte:head>
	<title>Command Deck - Strong Stage</title>
</svelte:head>

<div class="stage-stack space-y-4 sm:space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
		<h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Performance Command Deck</h1>
		<div class="flex items-center gap-2 sm:gap-3">
			{#if kpi}
				<LLMExport {kpi} recentWorkouts={allWorkouts} />
			{/if}
			<YearFilter />
			<UnitToggle bind:unit />
		</div>
	</div>

	{#if loading}
		<div class="flex flex-col items-center justify-center h-64 gap-3">
			<div class="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
			<p class="text-sm text-gray-500 dark:text-gray-400">Cueing your performance telemetry...</p>
		</div>
	{:else if error}
		<div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-700 dark:text-red-400">
			{error}
		</div>
	{:else if kpi}
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
			<div class="stage-pop"><KpiCard title="Sessions Played" value={kpi.total_workouts} icon={Activity} color="blue" /></div>
			<div class="stage-pop"><KpiCard title="Streak Flame" value={kpi.current_streak} subtitle="weeks" icon={Flame} color="orange" /></div>
			<div class="stage-pop"><KpiCard title="Total Tonnage" value="{formatVolume(kpi.total_volume, unit)}" subtitle={unit} icon={Dumbbell} color="green" /></div>
			<div class="stage-pop"><KpiCard title="Scene Length" value={formatDuration(kpi.avg_duration)} subtitle="avg" icon={Clock} color="purple" /></div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
			<div class="lg:col-span-2 order-2 lg:order-1">
				<VolumeChart data={volumeData} {unit} title="Volume Arc" />
			</div>
			<div class="order-1 lg:order-2">
				<ConsistencyScore workouts={allWorkouts} />
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
			<WorkoutCalendar workouts={allWorkouts} />
			<MuscleGroupChart data={categoryData} {unit} title="Muscle Ensemble" {workoutDetails} />
		</div>

		<MuscleGroupTrendChart {workoutDetails} {unit} />

		{#if cardioData.length > 0}
			<CardioChart data={cardioData} />
		{/if}
	{/if}
</div>
