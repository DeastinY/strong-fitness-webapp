<script lang="ts">
	import { onMount } from 'svelte';
	import type { Exercise, ExerciseProgress, ExercisePR, WorkoutWithSets, Unit } from '$lib/types';
	import { getExercises, getExerciseProgress, getExercisePRs, getWorkouts, getWorkout } from '$lib/api';
	import { formatWeight, formatVolume, formatDate } from '$lib/utils';
	import { getExerciseTip, type ExerciseTip } from '$lib/exerciseTips';
	import Card from '$lib/components/ui/Card.svelte';
	import ExerciseSelector from '$lib/components/dashboard/ExerciseSelector.svelte';
	import ExerciseTipCard from '$lib/components/dashboard/ExerciseTipCard.svelte';
	import ProgressChart from '$lib/components/charts/ProgressChart.svelte';
	import UnitToggle from '$lib/components/ui/UnitToggle.svelte';
	import { Trophy, Dumbbell, Repeat, Target } from 'lucide-svelte';
	import { yearFilter } from '$lib/stores/yearFilter';
	import YearFilter from '$lib/components/ui/YearFilter.svelte';

	let unit: Unit = 'lbs';
	let exercises: Exercise[] = [];
	let selectedExerciseId: number | null = null;
	let progress: ExerciseProgress[] = [];
	let prs: ExercisePR | null = null;
	let lastSession: WorkoutWithSets | null = null;
	let exerciseTip: ExerciseTip | null = null;
	let loading = true;
	let loadingProgress = false;
	let error: string | null = null;

	async function loadExercises() {
		try {
			loading = true;
			error = null;
			exercises = await getExercises();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load exercises';
		} finally {
			loading = false;
		}
	}

	async function loadExerciseData(exerciseId: number) {
		try {
			loadingProgress = true;
			lastSession = null;
			const [progressResult, prsResult, allWorkouts] = await Promise.all([
				getExerciseProgress(exerciseId),
				getExercisePRs(exerciseId),
				getWorkouts(0, 1000)
			]);
			progress = progressResult;
			prs = prsResult;

			// Find and fetch last session containing this exercise
			if (progressResult.length > 0) {
				const lastDate = progressResult[progressResult.length - 1].date.split('T')[0];
				const matchingWorkout = allWorkouts.find(w => w.date.startsWith(lastDate));
				if (matchingWorkout) {
					lastSession = await getWorkout(matchingWorkout.id);
				}
			}
		} catch (e) {
			console.error(e);
			progress = [];
			prs = null;
			lastSession = null;
		} finally {
			loadingProgress = false;
		}
	}

	$: if (selectedExerciseId) {
		loadExerciseData(selectedExerciseId);
	} else {
		progress = [];
		prs = null;
		lastSession = null;
	}

	$: selectedExercise = exercises.find((e) => e.id === selectedExerciseId);
	$: exerciseTip = selectedExercise ? getExerciseTip(selectedExercise.name) : null;

	let initialized = false;
	onMount(() => {
		loadExercises();
		initialized = true;
	});

	$: if (initialized && selectedExerciseId) $yearFilter, loadExerciseData(selectedExerciseId);
</script>

<svelte:head>
	<title>Exercises - Fitness Tracker</title>
</svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
		<h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Exercises</h1>
		<div class="flex items-center gap-2 sm:gap-3">
			<YearFilter />
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
	{:else}
		<Card class="p-6">
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Exercise</h2>
			<ExerciseSelector {exercises} bind:selectedId={selectedExerciseId} />
		</Card>

		{#if selectedExerciseId}
			{#if loadingProgress}
				<div class="flex items-center justify-center h-32">
					<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
				</div>
			{:else}
				{#if prs}
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card class="p-6">
							<div class="flex items-start justify-between">
								<div>
									<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Best Weight</p>
									<p class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
										{formatWeight(prs.best_weight, unit)}
									</p>
								</div>
								<div class="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg">
									<Trophy class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
								</div>
							</div>
						</Card>
						<Card class="p-6">
							<div class="flex items-start justify-between">
								<div>
									<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Best Volume</p>
									<p class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
										{formatVolume(prs.best_volume, unit)} {unit}
									</p>
								</div>
								<div class="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
									<Dumbbell class="w-5 h-5 text-blue-600 dark:text-blue-400" />
								</div>
							</div>
						</Card>
						<Card class="p-6">
							<div class="flex items-start justify-between">
								<div>
									<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Best Reps</p>
									<p class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{prs.best_reps}</p>
								</div>
								<div class="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg">
									<Repeat class="w-5 h-5 text-green-600 dark:text-green-400" />
								</div>
							</div>
						</Card>
						<Card class="p-6">
							<div class="flex items-start justify-between">
								<div>
									<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Est. 1RM</p>
									<p class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
										{formatWeight(prs.best_estimated_1rm, unit)}
									</p>
								</div>
								<div class="p-3 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
									<Target class="w-5 h-5 text-purple-600 dark:text-purple-400" />
								</div>
							</div>
						</Card>
					</div>
				{/if}

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<ProgressChart
						data={progress}
						{unit}
						title="{selectedExercise?.name || 'Exercise'} Progress"
					/>

					{#if exerciseTip}
						<div>
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
								{selectedExercise?.name} Guide
							</h3>
							<ExerciseTipCard tip={exerciseTip} />
						</div>
					{/if}
				</div>

				{#if lastSession && selectedExerciseId}
					{@const exerciseSets = lastSession.sets.filter(s => s.exercise_id === selectedExerciseId)}
					{#if exerciseSets.length > 0}
						<Card class="p-4 sm:p-6">
							<h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
								Last Session <span class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">{formatDate(lastSession.date)}</span>
							</h3>
							{@const hasRpe = exerciseSets.some(s => s.rpe != null)}
							<div class="grid gap-1.5 text-sm" style="grid-template-columns: repeat({hasRpe ? 5 : 4}, minmax(0, 1fr))">
								<div class="font-medium text-gray-500 dark:text-gray-400 text-xs">Set</div>
								<div class="font-medium text-gray-500 dark:text-gray-400 text-xs">Weight</div>
								<div class="font-medium text-gray-500 dark:text-gray-400 text-xs">Reps</div>
								<div class="font-medium text-gray-500 dark:text-gray-400 text-xs">Vol</div>
								{#if hasRpe}<div class="font-medium text-gray-500 dark:text-gray-400 text-xs">RPE</div>{/if}
								{#each exerciseSets as set}
									<div class="text-gray-900 dark:text-gray-200">{set.set_order || '-'}</div>
									<div class="text-gray-900 dark:text-gray-200">{formatWeight(set.weight_lbs, unit)}</div>
									<div class="text-gray-900 dark:text-gray-200">{set.reps || '-'}</div>
									<div class="text-gray-900 dark:text-gray-200">{formatVolume(set.volume, unit)}</div>
									{#if hasRpe}<div class="text-gray-900 dark:text-gray-200">{set.rpe ?? '-'}</div>{/if}
								{/each}
							</div>
						</Card>
					{/if}
				{/if}
			{/if}
		{:else}
			<Card class="p-12">
				<div class="text-center text-gray-500 dark:text-gray-400">
					<Dumbbell class="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
					<p>Select an exercise above to view progress and personal records</p>
				</div>
			</Card>
		{/if}
	{/if}
</div>
