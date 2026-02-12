<script lang="ts">
	import { onMount } from 'svelte';
	import type { Exercise, ExerciseProgress, ExercisePR, Unit } from '$lib/types';
	import { getExercises, getExerciseProgress, getExercisePRs } from '$lib/api';
	import { formatWeight, formatVolume } from '$lib/utils';
	import Card from '$lib/components/ui/Card.svelte';
	import ExerciseSelector from '$lib/components/dashboard/ExerciseSelector.svelte';
	import ProgressChart from '$lib/components/charts/ProgressChart.svelte';
	import UnitToggle from '$lib/components/ui/UnitToggle.svelte';
	import { Trophy, Dumbbell, Repeat, Target } from 'lucide-svelte';

	let unit: Unit = 'lbs';
	let exercises: Exercise[] = [];
	let selectedExerciseId: number | null = null;
	let progress: ExerciseProgress[] = [];
	let prs: ExercisePR | null = null;
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
			const [progressResult, prsResult] = await Promise.all([
				getExerciseProgress(exerciseId),
				getExercisePRs(exerciseId)
			]);
			progress = progressResult;
			prs = prsResult;
		} catch (e) {
			console.error(e);
			progress = [];
			prs = null;
		} finally {
			loadingProgress = false;
		}
	}

	$: if (selectedExerciseId) {
		loadExerciseData(selectedExerciseId);
	} else {
		progress = [];
		prs = null;
	}

	$: selectedExercise = exercises.find((e) => e.id === selectedExerciseId);

	onMount(() => {
		loadExercises();
	});
</script>

<svelte:head>
	<title>Exercises - Fitness Tracker</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900">Exercise Analysis</h1>
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
	{:else}
		<Card class="p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">Select Exercise</h2>
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
									<p class="text-sm font-medium text-gray-500">Best Weight</p>
									<p class="mt-2 text-2xl font-bold text-gray-900">
										{formatWeight(prs.best_weight, unit)}
									</p>
								</div>
								<div class="p-3 bg-yellow-50 rounded-lg">
									<Trophy class="w-5 h-5 text-yellow-600" />
								</div>
							</div>
						</Card>
						<Card class="p-6">
							<div class="flex items-start justify-between">
								<div>
									<p class="text-sm font-medium text-gray-500">Best Volume</p>
									<p class="mt-2 text-2xl font-bold text-gray-900">
										{formatVolume(prs.best_volume, unit)} {unit}
									</p>
								</div>
								<div class="p-3 bg-blue-50 rounded-lg">
									<Dumbbell class="w-5 h-5 text-blue-600" />
								</div>
							</div>
						</Card>
						<Card class="p-6">
							<div class="flex items-start justify-between">
								<div>
									<p class="text-sm font-medium text-gray-500">Best Reps</p>
									<p class="mt-2 text-2xl font-bold text-gray-900">{prs.best_reps}</p>
								</div>
								<div class="p-3 bg-green-50 rounded-lg">
									<Repeat class="w-5 h-5 text-green-600" />
								</div>
							</div>
						</Card>
						<Card class="p-6">
							<div class="flex items-start justify-between">
								<div>
									<p class="text-sm font-medium text-gray-500">Est. 1RM</p>
									<p class="mt-2 text-2xl font-bold text-gray-900">
										{formatWeight(prs.best_estimated_1rm, unit)}
									</p>
								</div>
								<div class="p-3 bg-purple-50 rounded-lg">
									<Target class="w-5 h-5 text-purple-600" />
								</div>
							</div>
						</Card>
					</div>
				{/if}

				<ProgressChart
					data={progress}
					{unit}
					title="{selectedExercise?.name || 'Exercise'} Progress"
				/>
			{/if}
		{:else}
			<Card class="p-12">
				<div class="text-center text-gray-500">
					<Dumbbell class="w-12 h-12 mx-auto mb-4 text-gray-300" />
					<p>Select an exercise above to view progress and personal records</p>
				</div>
			</Card>
		{/if}
	{/if}
</div>
