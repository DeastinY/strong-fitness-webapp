<script lang="ts">
	import { onMount } from 'svelte';
	import type { WorkoutSummary, WorkoutWithSets, Unit } from '$lib/types';
	import { getWorkouts, getWorkout } from '$lib/api';
	import { formatDate, formatDateTime, formatDuration, formatVolume, formatWeight, getCategoryColor } from '$lib/utils';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import UnitToggle from '$lib/components/ui/UnitToggle.svelte';
	import WorkoutConsistencyCharts from '$lib/components/charts/WorkoutConsistencyCharts.svelte';
	import { ChevronDown, ChevronUp, Dumbbell, Clock, Layers } from 'lucide-svelte';

	let unit: Unit = 'lbs';
	let allWorkouts: WorkoutSummary[] = [];
	let workouts: WorkoutSummary[] = [];
	let expandedWorkout: WorkoutWithSets | null = null;
	let expandedId: number | null = null;
	let loading = true;
	let loadingDetails = false;
	let error: string | null = null;
	let skip = 0;
	const limit = 20;
	let hasMore = true;

	async function loadWorkouts() {
		try {
			loading = true;
			error = null;
			// Fetch all for charts, then page the list
			allWorkouts = await getWorkouts(0, 1000);
			workouts = allWorkouts.slice(0, limit);
			skip = workouts.length;
			hasMore = allWorkouts.length > limit;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load workouts';
		} finally {
			loading = false;
		}
	}

	function loadMore() {
		if (!hasMore) return;
		const next = allWorkouts.slice(skip, skip + limit);
		workouts = [...workouts, ...next];
		skip += next.length;
		hasMore = skip < allWorkouts.length;
	}

	async function toggleExpand(id: number) {
		if (expandedId === id) {
			expandedId = null;
			expandedWorkout = null;
			return;
		}

		try {
			loadingDetails = true;
			expandedId = id;
			expandedWorkout = await getWorkout(id);
		} catch (e) {
			console.error(e);
			expandedId = null;
		} finally {
			loadingDetails = false;
		}
	}

	function groupSetsByExercise(sets: WorkoutWithSets['sets']) {
		const grouped: Record<string, typeof sets> = {};
		for (const set of sets) {
			const name = set.exercise?.name || 'Unknown';
			if (!grouped[name]) grouped[name] = [];
			grouped[name].push(set);
		}
		return Object.entries(grouped);
	}

	onMount(() => {
		loadWorkouts();
	});
</script>

<svelte:head>
	<title>Workouts - Fitness Tracker</title>
</svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Workouts</h1>
		<UnitToggle bind:unit />
	</div>

	{#if loading}
		<div class="flex flex-col items-center justify-center h-64 gap-3">
			<div class="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
			<p class="text-sm text-gray-500 dark:text-gray-400">Loading workouts...</p>
		</div>
	{:else if error}
		<div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-700 dark:text-red-400">
			{error}
		</div>
	{:else}
		{#if allWorkouts.length > 0}
			<WorkoutConsistencyCharts workouts={allWorkouts} {unit} />
		{/if}

		<div class="space-y-3 sm:space-y-4">
			{#each workouts as workout (workout.id)}
				<Card class="overflow-hidden">
					<button
						class="w-full px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 active:bg-gray-100 dark:active:bg-gray-700/50 transition-colors"
						on:click={() => toggleExpand(workout.id)}
					>
						<div class="flex items-center justify-between gap-3">
							<div class="min-w-0 flex-1">
								<p class="font-semibold text-gray-900 dark:text-white truncate">{workout.name}</p>
								<p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{formatDateTime(workout.date)}</p>
							</div>
							<div class="flex items-center gap-2 sm:gap-4 flex-shrink-0">
								<div class="hidden sm:flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
									<span class="flex items-center gap-1">
										<Dumbbell class="w-4 h-4" />
										{formatVolume(workout.total_volume, unit)}
									</span>
									<span class="flex items-center gap-1">
										<Clock class="w-4 h-4" />
										{formatDuration(workout.duration_minutes)}
									</span>
									<span class="flex items-center gap-1">
										<Layers class="w-4 h-4" />
										{workout.set_count}
									</span>
								</div>
								<div class="flex sm:hidden items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
									<span>{formatDuration(workout.duration_minutes)}</span>
									<span>{workout.set_count} sets</span>
								</div>
								{#if expandedId === workout.id}
									<ChevronUp class="w-5 h-5 text-gray-400" />
								{:else}
									<ChevronDown class="w-5 h-5 text-gray-400" />
								{/if}
							</div>
						</div>
					</button>

					{#if expandedId === workout.id}
						<div class="px-4 sm:px-6 pb-4 border-t border-gray-100 dark:border-gray-700/50">
							{#if loadingDetails}
								<div class="py-8 flex justify-center">
									<div class="w-6 h-6 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin"></div>
								</div>
							{:else if expandedWorkout}
								<div class="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
									{#each groupSetsByExercise(expandedWorkout.sets) as [exerciseName, sets]}
										{@const category = sets[0]?.exercise?.category || 'other'}
										<div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 sm:p-4">
											<div class="flex items-center gap-2 mb-2 sm:mb-3">
												<span
													class="w-2.5 h-2.5 rounded-full"
													style="background-color: {getCategoryColor(category)}"
												></span>
												<h4 class="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{exerciseName}</h4>
											</div>
											<div class="grid grid-cols-4 gap-1.5 sm:gap-2 text-xs sm:text-sm">
												<div class="font-medium text-gray-500 dark:text-gray-400">Set</div>
												<div class="font-medium text-gray-500 dark:text-gray-400">Weight</div>
												<div class="font-medium text-gray-500 dark:text-gray-400">Reps</div>
												<div class="font-medium text-gray-500 dark:text-gray-400">Vol</div>
												{#each sets as set}
													<div class="text-gray-900 dark:text-gray-200">{set.set_order || '-'}</div>
													<div class="text-gray-900 dark:text-gray-200">{formatWeight(set.weight_lbs, unit)}</div>
													<div class="text-gray-900 dark:text-gray-200">{set.reps || '-'}</div>
													<div class="text-gray-900 dark:text-gray-200">{formatVolume(set.volume, unit)}</div>
												{/each}
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				</Card>
			{/each}
		</div>

		{#if hasMore}
			<div class="flex justify-center pt-2 sm:pt-4">
				<Button variant="secondary" on:click={loadMore}>Load More</Button>
			</div>
		{/if}
	{/if}
</div>
