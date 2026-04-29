<script lang="ts">
	import { onMount } from 'svelte';
	import type { ExercisePRSummary, Unit } from '$lib/types';
	import { getAllPRs } from '$lib/api';
	import { formatWeight, formatDate } from '$lib/utils';
	import Card from '$lib/components/ui/Card.svelte';
	import UnitToggle from '$lib/components/ui/UnitToggle.svelte';
	import { Trophy, ArrowUpDown } from 'lucide-svelte';

	let unit: Unit = 'lbs';
	let records: ExercisePRSummary[] = [];
	let loading = true;
	let error: string | null = null;
	let sortKey: 'name' | 'weight' | '1rm' = 'weight';
	let sortAsc = false;

	async function loadRecords() {
		try {
			loading = true;
			error = null;
			records = await getAllPRs();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load records';
		} finally {
			loading = false;
		}
	}

	function toggleSort(key: typeof sortKey) {
		if (sortKey === key) {
			sortAsc = !sortAsc;
		} else {
			sortKey = key;
			sortAsc = key === 'name';
		}
	}

	$: sorted = [...records].sort((a, b) => {
		let diff = 0;
		if (sortKey === 'name') diff = a.exercise_name.localeCompare(b.exercise_name);
		else if (sortKey === 'weight') diff = b.best_weight - a.best_weight;
		else diff = b.best_estimated_1rm - a.best_estimated_1rm;
		return sortAsc ? -diff : diff;
	});

	onMount(() => {
		loadRecords();
	});
</script>

<svelte:head>
	<title>Records - Fitness Tracker</title>
</svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
		<h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">All-Time Records</h1>
		<UnitToggle bind:unit />
	</div>

	{#if loading}
		<div class="flex flex-col items-center justify-center h-64 gap-3">
			<div class="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
			<p class="text-sm text-gray-500 dark:text-gray-400">Loading records...</p>
		</div>
	{:else if error}
		<div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-700 dark:text-red-400">
			{error}
		</div>
	{:else}
		<Card class="overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-gray-100 dark:border-gray-700/50">
							<th class="text-left px-4 sm:px-6 py-3">
								<button
									class="flex items-center gap-1 font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
									on:click={() => toggleSort('name')}
								>
									Exercise
									<ArrowUpDown class="w-3 h-3 {sortKey === 'name' ? 'text-blue-500' : ''}" />
								</button>
							</th>
							<th class="text-right px-3 sm:px-4 py-3">
								<button
									class="flex items-center gap-1 font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ml-auto"
									on:click={() => toggleSort('weight')}
								>
									Best Weight
									<ArrowUpDown class="w-3 h-3 {sortKey === 'weight' ? 'text-blue-500' : ''}" />
								</button>
							</th>
							<th class="text-right px-3 sm:px-4 py-3 hidden sm:table-cell">
								<span class="font-semibold text-gray-500 dark:text-gray-400">Best Reps</span>
							</th>
							<th class="text-right px-3 sm:px-4 py-3">
								<button
									class="flex items-center gap-1 font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ml-auto"
									on:click={() => toggleSort('1rm')}
								>
									Est. 1RM
									<ArrowUpDown class="w-3 h-3 {sortKey === '1rm' ? 'text-blue-500' : ''}" />
								</button>
							</th>
							<th class="text-right px-4 sm:px-6 py-3 hidden md:table-cell">
								<span class="font-semibold text-gray-500 dark:text-gray-400">Date</span>
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-50 dark:divide-gray-700/30">
						{#each sorted as record, i}
							<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
								<td class="px-4 sm:px-6 py-3 sm:py-4">
									<div class="flex items-center gap-2">
										{#if i < 3}
											<Trophy class="w-4 h-4 flex-shrink-0 {i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-amber-600'}" />
										{:else}
											<span class="w-4 h-4 flex-shrink-0 text-center text-xs text-gray-400 dark:text-gray-600">{i + 1}</span>
										{/if}
										<span class="font-medium text-gray-900 dark:text-white">{record.exercise_name}</span>
									</div>
								</td>
								<td class="px-3 sm:px-4 py-3 sm:py-4 text-right font-semibold text-gray-900 dark:text-white">
									{formatWeight(record.best_weight, unit)}
								</td>
								<td class="px-3 sm:px-4 py-3 sm:py-4 text-right text-gray-600 dark:text-gray-300 hidden sm:table-cell">
									{Math.round(record.best_reps)}
								</td>
								<td class="px-3 sm:px-4 py-3 sm:py-4 text-right text-blue-600 dark:text-blue-400 font-medium">
									{formatWeight(record.best_estimated_1rm, unit)}
								</td>
								<td class="px-4 sm:px-6 py-3 sm:py-4 text-right text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">
									{record.best_weight_date ? formatDate(record.best_weight_date) : '—'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card>

		<p class="text-xs text-center text-gray-400 dark:text-gray-600">
			All-time personal records across all sessions. Est. 1RM uses Epley formula.
		</p>
	{/if}
</div>
