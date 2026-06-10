<script lang="ts">
	import type { KPIStats, WorkoutSummary, WorkoutWithSets } from '$lib/types';
	import { getWorkout } from '$lib/api';
	import { Copy, Check, MessageSquare } from 'lucide-svelte';
	import Button from '../ui/Button.svelte';

	export let kpi: KPIStats;
	export let recentWorkouts: WorkoutSummary[];

	let copied = false;
	let showModal = false;
	let summary = '';
	let loading = false;

	function fmtDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function formatWorkoutLog(workouts: WorkoutWithSets[]): string {
		const lines: string[] = [];

		const sorted = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

		for (const workout of sorted) {
			const dur = workout.duration_minutes ? ` (${workout.duration_minutes}min)` : '';
			lines.push(`${fmtDate(workout.date)}${dur}`);

			// Group sets by exercise, preserving encounter order
			const exerciseOrder: string[] = [];
			const exerciseSets = new Map<string, typeof workout.sets>();

			for (const set of workout.sets) {
				const name = set.exercise?.name ?? 'Unknown';
				if (!exerciseSets.has(name)) {
					exerciseSets.set(name, []);
					exerciseOrder.push(name);
				}
				exerciseSets.get(name)!.push(set);
			}

			for (const name of exerciseOrder) {
				const sets = exerciseSets.get(name)!;
				const category = sets[0].exercise?.category;

				if (category === 'cardio') {
					const s = sets[0];
					const parts: string[] = [];
					if (s.distance) parts.push(`${s.distance}km`);
					if (s.seconds) parts.push(`${s.seconds}s`);
					lines.push(`  ${name}: ${parts.join(' / ')}`);
				} else {
					const setsStr = sets
						.map(s => {
							const w = s.weight_lbs != null ? Math.round(s.weight_lbs) : null;
							const r = s.reps != null ? Math.round(s.reps) : null;
							const fail = s.set_order === 'F' ? 'F' : '';
							if (w && r) return `${w}×${r}${fail}`;
							if (r) return `${r}r${fail}`;
							return '?';
						})
						.join(', ');
					lines.push(`  ${name}: ${setsStr}`);
				}
			}

			lines.push('');
		}

		return lines.join('\n').trimEnd();
	}

	async function generateSummary(workouts: WorkoutWithSets[]): Promise<string> {
		const now = new Date();
		const threeMonthsAgo = new Date(now);
		threeMonthsAgo.setMonth(now.getMonth() - 3);

		const dateOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
		const start = threeMonthsAgo.toLocaleDateString('en-US', dateOpts);
		const end = now.toLocaleDateString('en-US', dateOpts);

		const header = [
			`PERFORMANCE LOGBOOK — last 3 months`,
			`${start} to ${end} | ${workouts.length} sessions | avg ${Math.round(kpi.avg_duration)} min | streak: ${kpi.current_streak} weeks`,
			`31yo male, mostly sedentary, returned to training Jan 2026`,
			``,
			`---`,
			``
		].join('\n');

		return header + formatWorkoutLog(workouts);
	}

	async function handleExport() {
		loading = true;
		try {
			const threeMonthsAgo = new Date();
			threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

			const inRange = recentWorkouts.filter(w => new Date(w.date) >= threeMonthsAgo);
			const details = await Promise.all(inRange.map(w => getWorkout(w.id)));

			summary = await generateSummary(details);
			showModal = true;
		} catch (err) {
			console.error('Failed to generate export:', err);
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
	<span class="hidden sm:inline">{loading ? 'Building...' : 'Generate AI Script'}</span>
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
			<h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">AI-Ready Performance Script</h2>
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
			<p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">Paste into ChatGPT, Claude, or your coach bot.</p>
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
