<script lang="ts">
	import type { KPIStats, VolumeDataPoint, CategoryVolume, WorkoutSummary, WorkoutWithSets } from '$lib/types';
	import { getWorkout } from '$lib/api';
	import { Copy, Check, MessageSquare } from 'lucide-svelte';
	import Button from '../ui/Button.svelte';

	export let kpi: KPIStats;
	export let volumeData: VolumeDataPoint[];
	export let categoryData: CategoryVolume[];
	export let recentWorkouts: WorkoutSummary[];

	let copied = false;
	let showModal = false;
	let summary = '';
	let loading = false;
	let workoutDetails: WorkoutWithSets[] = [];

	interface ExerciseProgress {
		name: string;
		sessions: Array<{
			date: string;
			sets: Array<{ weight: number | null; reps: number | null }>;
			totalVolume: number;
			maxWeight: number;
		}>;
	}

	function calculateExerciseProgress(workouts: WorkoutWithSets[]): ExerciseProgress[] {
		const exerciseMap = new Map<string, ExerciseProgress>();

		for (const workout of workouts) {
			const dateStr = new Date(workout.date).toLocaleDateString();

			// Group sets by exercise for this workout
			const exerciseSets = new Map<string, Array<{ weight: number | null; reps: number | null }>>();

			for (const set of workout.sets) {
				const name = set.exercise?.name || 'Unknown';
				if (!exerciseSets.has(name)) {
					exerciseSets.set(name, []);
				}
				exerciseSets.get(name)!.push({
					weight: set.weight_lbs,
					reps: set.reps
				});
			}

			// Add to exercise progress
			for (const [name, sets] of exerciseSets) {
				if (!exerciseMap.has(name)) {
					exerciseMap.set(name, { name, sessions: [] });
				}

				const totalVolume = sets.reduce((sum, s) => sum + ((s.weight || 0) * (s.reps || 0)), 0);
				const maxWeight = Math.max(...sets.map(s => s.weight || 0));

				exerciseMap.get(name)!.sessions.push({
					date: dateStr,
					sets,
					totalVolume,
					maxWeight
				});
			}
		}

		return Array.from(exerciseMap.values());
	}

	function formatExerciseProgress(progress: ExerciseProgress[]): string {
		const lines: string[] = [];

		for (const exercise of progress) {
			if (exercise.name === 'Elliptical Machine') continue; // Skip cardio

			lines.push(`\n${exercise.name}:`);

			const sessions = exercise.sessions.slice(0, 5); // Last 5 sessions

			for (let i = 0; i < sessions.length; i++) {
				const session = sessions[i];
				const setsStr = session.sets
					.map(s => s.weight ? `${s.weight}x${s.reps}` : `${s.reps}r`)
					.join(', ');

				let changeStr = '';
				if (i < sessions.length - 1) {
					const prevSession = sessions[i + 1];
					if (prevSession.totalVolume > 0 && session.totalVolume > 0) {
						const volumeChange = ((session.totalVolume - prevSession.totalVolume) / prevSession.totalVolume) * 100;
						if (Math.abs(volumeChange) >= 1) {
							changeStr = volumeChange > 0 ? ` [+${volumeChange.toFixed(0)}%]` : ` [${volumeChange.toFixed(0)}%]`;
						}
					}
				}

				lines.push(`  ${session.date}: ${setsStr} (vol: ${session.totalVolume})${changeStr}`);
			}

			// Overall progress from first to last
			if (sessions.length >= 2) {
				const first = sessions[sessions.length - 1];
				const last = sessions[0];

				if (first.totalVolume > 0) {
					const totalChange = ((last.totalVolume - first.totalVolume) / first.totalVolume) * 100;
					const weightChange = first.maxWeight > 0
						? ((last.maxWeight - first.maxWeight) / first.maxWeight) * 100
						: 0;

					lines.push(`  → Overall: volume ${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(0)}%, max weight ${weightChange >= 0 ? '+' : ''}${weightChange.toFixed(0)}%`);
				}
			}
		}

		return lines.join('\n');
	}

	async function generateSummary(): Promise<string> {
		// Data is already filtered to 2026 by the API
		const totalVolume = volumeData.reduce((sum, v) => sum + v.volume, 0);
		const avgVolume = volumeData.length > 0
			? Math.round(totalVolume / volumeData.length)
			: 0;

		// Calculate trend
		let trend = 'stable';
		let trendDetail = '';
		if (volumeData.length >= 6) {
			const recent = volumeData.slice(-3).reduce((sum, v) => sum + v.volume, 0) / 3;
			const previous = volumeData.slice(-6, -3).reduce((sum, v) => sum + v.volume, 0) / 3;
			const change = ((recent - previous) / previous) * 100;
			if (change > 10) {
				trend = 'increasing';
				trendDetail = `+${change.toFixed(0)}% vs previous 3 workouts`;
			} else if (change < -10) {
				trend = 'decreasing';
				trendDetail = `${change.toFixed(0)}% vs previous 3 workouts`;
			}
		}

		// Category breakdown
		const totalCatVolume = categoryData.reduce((sum, c) => sum + c.volume, 0);
		const categories = categoryData
			.sort((a, b) => b.volume - a.volume)
			.map(c => `${c.category}: ${((c.volume / totalCatVolume) * 100).toFixed(0)}%`)
			.join(', ');

		// Workout frequency
		const dates = recentWorkouts.map(w => new Date(w.date));
		let avgDaysBetween = 0;
		if (dates.length >= 2) {
			const diffs = [];
			for (let i = 1; i < dates.length; i++) {
				diffs.push((dates[i-1].getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24));
			}
			avgDaysBetween = diffs.reduce((a, b) => a + b, 0) / diffs.length;
		}

		// Date range
		const firstDate = volumeData.length > 0 ? new Date(volumeData[0].date).toLocaleDateString() : 'N/A';
		const lastDate = volumeData.length > 0 ? new Date(volumeData[volumeData.length - 1].date).toLocaleDateString() : 'N/A';

		// Exercise progress
		const exerciseProgress = calculateExerciseProgress(workoutDetails);
		const progressStr = formatExerciseProgress(exerciseProgress);

		// Volume progression over time
		const volumeProgression = volumeData.length >= 2
			? ((volumeData[volumeData.length - 1].volume - volumeData[0].volume) / volumeData[0].volume) * 100
			: 0;

		return `FITNESS DATA SUMMARY
====================

ABOUT ME
31 year old male, mostly sedentary lifestyle, started training again this year.

TRAINING OVERVIEW (2026 only)
Period: ${firstDate} to ${lastDate}
Total workouts: ${recentWorkouts.length}
Weekly streak: ${kpi.current_streak} weeks
Avg duration: ${Math.round(kpi.avg_duration)} min
Frequency: every ${avgDaysBetween.toFixed(1)} days

VOLUME STATS (lbs)
Total lifted: ${Math.round(totalVolume).toLocaleString()}
Avg per workout: ${avgVolume.toLocaleString()}
First workout volume: ${volumeData.length > 0 ? Math.round(volumeData[0].volume).toLocaleString() : 'N/A'}
Latest workout volume: ${volumeData.length > 0 ? Math.round(volumeData[volumeData.length - 1].volume).toLocaleString() : 'N/A'}
Overall progression: ${volumeProgression >= 0 ? '+' : ''}${volumeProgression.toFixed(0)}%
Recent trend: ${trend}${trendDetail ? ` (${trendDetail})` : ''}

MUSCLE DISTRIBUTION
${categories}

EXERCISE PROGRESS (last 5 sessions, weight x reps)
${progressStr}

---
Please analyze my fitness data and provide:
1. Assessment of my current progress and consistency
2. Which exercises show good/poor progression
3. Recommendations for weights/reps adjustments
4. Any muscle imbalances or concerns`;
	}

	async function handleExport() {
		loading = true;
		try {
			// Fetch details for recent workouts (up to 10) - already filtered to 2026 by API
			const fetchCount = Math.min(recentWorkouts.length, 10);
			const details = await Promise.all(
				recentWorkouts.slice(0, fetchCount).map(w => getWorkout(w.id))
			);
			workoutDetails = details;
			summary = await generateSummary();
			showModal = true;
		} catch (err) {
			console.error('Failed to generate summary:', err);
		} finally {
			loading = false;
		}
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(summary);
			copied = true;
			setTimeout(() => { copied = false; }, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	function closeModal() {
		showModal = false;
	}
</script>

<Button variant="secondary" on:click={handleExport} disabled={loading} class="gap-1.5 sm:gap-2">
	<MessageSquare class="w-4 h-4" />
	<span class="hidden sm:inline">{loading ? 'Loading...' : 'Export for AI'}</span>
	<span class="sm:hidden">{loading ? '...' : 'AI'}</span>
</Button>

{#if showModal}
<div
	class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
	on:click={closeModal}
	on:keydown={(e) => e.key === 'Escape' && closeModal()}
	role="dialog"
	tabindex="-1"
>
	<div
		class="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col"
		on:click|stopPropagation
		on:keydown|stopPropagation
		role="document"
	>
		<div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700/50">
			<h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">AI-Ready Summary</h2>
			<button
				class="p-2 -mr-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
				on:click={closeModal}
			>
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<div class="p-4 overflow-y-auto flex-1">
			<pre class="text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 sm:p-4 whitespace-pre-wrap font-mono leading-relaxed">{summary}</pre>
		</div>

		<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
			<p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">Paste into ChatGPT, Claude, etc.</p>
			<Button on:click={copyToClipboard} class="gap-2 w-full sm:w-auto justify-center">
				{#if copied}
					<Check class="w-4 h-4" />
					Copied!
				{:else}
					<Copy class="w-4 h-4" />
					Copy to Clipboard
				{/if}
			</Button>
		</div>
	</div>
</div>
{/if}
