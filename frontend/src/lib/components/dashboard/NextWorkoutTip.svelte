<script lang="ts">
	import type { WorkoutWithSets, CategoryVolume } from '$lib/types';
	import Card from '../ui/Card.svelte';
	import { Zap, TrendingUp, Target, AlertTriangle, Dumbbell, RotateCcw } from 'lucide-svelte';

	export let workoutDetails: WorkoutWithSets[];
	export let categoryData: CategoryVolume[];

	interface Recommendation {
		type: 'progressive' | 'balance' | 'consistency' | 'recovery' | 'challenge';
		icon: any;
		title: string;
		message: string;
		exercise?: string;
		detail?: string;
		color: string;
	}

	function analyzeAndRecommend(): Recommendation {
		if (workoutDetails.length === 0) {
			return {
				type: 'consistency',
				icon: Zap,
				title: 'Start Your Journey',
				message: 'Log your first workout to get personalized recommendations!',
				color: 'blue'
			};
		}

		const recommendations: Recommendation[] = [];

		// Analyze exercise progress for progressive overload opportunities
		const exerciseStats = new Map<string, {
			lastWeight: number;
			lastReps: number;
			maxWeight: number;
			sessions: number;
			lastDate: Date;
			category: string;
		}>();

		for (const workout of workoutDetails) {
			for (const set of workout.sets) {
				if (!set.weight_lbs || !set.reps || set.exercise?.category === 'cardio') continue;

				const name = set.exercise?.name || 'Unknown';
				const existing = exerciseStats.get(name);
				const workoutDate = new Date(workout.date);

				if (!existing || workoutDate > existing.lastDate) {
					exerciseStats.set(name, {
						lastWeight: set.weight_lbs,
						lastReps: set.reps,
						maxWeight: Math.max(existing?.maxWeight || 0, set.weight_lbs),
						sessions: (existing?.sessions || 0) + 1,
						lastDate: workoutDate,
						category: set.exercise?.category || 'other'
					});
				} else if (existing) {
					existing.maxWeight = Math.max(existing.maxWeight, set.weight_lbs);
					existing.sessions++;
				}
			}
		}

		// Find exercises ready for progressive overload (done 3+ times, hitting reps consistently)
		for (const [name, stats] of exerciseStats) {
			if (stats.sessions >= 3 && stats.lastReps >= 10) {
				const suggestedWeight = Math.round((stats.lastWeight * 1.05) / 5) * 5; // Round to nearest 5
				if (suggestedWeight > stats.lastWeight) {
					recommendations.push({
						type: 'progressive',
						icon: TrendingUp,
						title: 'Ready to Progress',
						message: `You've been consistent with ${name}. Try increasing the weight.`,
						exercise: name,
						detail: `Current: ${stats.lastWeight} lbs × ${stats.lastReps} reps → Try: ${suggestedWeight} lbs × 8 reps`,
						color: 'green'
					});
				}
			}
		}

		// Check for muscle imbalances
		if (categoryData.length >= 2) {
			const sorted = [...categoryData].sort((a, b) => b.volume - a.volume);
			const total = sorted.reduce((sum, c) => sum + c.volume, 0);
			const highest = sorted[0];
			const lowest = sorted[sorted.length - 1];

			if (lowest && highest && total > 0) {
				const lowestPercent = (lowest.volume / total) * 100;
				const highestPercent = (highest.volume / total) * 100;

				if (lowestPercent < 10 && highestPercent > 30) {
					recommendations.push({
						type: 'balance',
						icon: Target,
						title: 'Balance Your Training',
						message: `Your ${lowest.category} volume is low compared to ${highest.category}. Consider adding more ${lowest.category} work.`,
						detail: `${lowest.category}: ${lowestPercent.toFixed(0)}% vs ${highest.category}: ${highestPercent.toFixed(0)}%`,
						color: 'amber'
					});
				}
			}
		}

		// Check days since last workout
		if (workoutDetails.length > 0) {
			const lastWorkout = new Date(workoutDetails[0].date);
			const daysSince = Math.floor((Date.now() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));

			if (daysSince >= 4) {
				recommendations.push({
					type: 'consistency',
					icon: RotateCcw,
					title: 'Time to Train',
					message: `It's been ${daysSince} days since your last workout. Your muscles are recovered and ready!`,
					detail: 'Consistency beats intensity for long-term progress',
					color: 'blue'
				});
			}
		}

		// Find an exercise to challenge (highest weight exercise)
		let challengeExercise = '';
		let challengeWeight = 0;
		for (const [name, stats] of exerciseStats) {
			if (stats.maxWeight > challengeWeight && stats.sessions >= 2) {
				challengeWeight = stats.maxWeight;
				challengeExercise = name;
			}
		}

		if (challengeExercise && challengeWeight > 0) {
			const targetWeight = Math.round((challengeWeight * 1.025) / 5) * 5;
			recommendations.push({
				type: 'challenge',
				icon: Dumbbell,
				title: 'Challenge Yourself',
				message: `Push for a new personal best on ${challengeExercise}.`,
				exercise: challengeExercise,
				detail: `Current best: ${challengeWeight} lbs → Target: ${targetWeight} lbs`,
				color: 'purple'
			});
		}

		// Recovery reminder if trained same muscle group recently
		if (workoutDetails.length >= 1) {
			const lastWorkout = workoutDetails[0];
			const lastDate = new Date(lastWorkout.date);
			const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

			if (daysSince <= 1) {
				const musclesWorked = new Set(
					lastWorkout.sets
						.filter(s => s.exercise?.category && s.exercise.category !== 'cardio')
						.map(s => s.exercise?.category)
				);

				if (musclesWorked.size > 0) {
					const muscles = Array.from(musclesWorked).join(', ');
					recommendations.push({
						type: 'recovery',
						icon: AlertTriangle,
						title: 'Recovery Note',
						message: `You trained ${muscles} yesterday. Consider working different muscle groups today.`,
						detail: 'Allow 48-72 hours between training the same muscles',
						color: 'orange'
					});
				}
			}
		}

		// Return the most relevant recommendation
		// Priority: recovery > consistency > balance > progressive > challenge
		const priority = ['recovery', 'consistency', 'balance', 'progressive', 'challenge'];
		for (const type of priority) {
			const rec = recommendations.find(r => r.type === type);
			if (rec) return rec;
		}

		// Default recommendation
		return {
			type: 'progressive',
			icon: Zap,
			title: 'Keep It Up',
			message: 'You\'re on track! Focus on maintaining good form and gradually increasing intensity.',
			detail: 'Small, consistent improvements lead to big results',
			color: 'blue'
		};
	}

	$: recommendation = analyzeAndRecommend();

	const colorClasses: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
		green: {
			bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
			border: 'border-green-200 dark:border-green-800',
			icon: 'from-green-500 to-emerald-600',
			badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
		},
		blue: {
			bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
			border: 'border-blue-200 dark:border-blue-800',
			icon: 'from-blue-500 to-indigo-600',
			badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
		},
		amber: {
			bg: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
			border: 'border-amber-200 dark:border-amber-800',
			icon: 'from-amber-500 to-yellow-600',
			badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
		},
		orange: {
			bg: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
			border: 'border-orange-200 dark:border-orange-800',
			icon: 'from-orange-500 to-red-600',
			badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
		},
		purple: {
			bg: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
			border: 'border-purple-200 dark:border-purple-800',
			icon: 'from-purple-500 to-violet-600',
			badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
		}
	};

	$: colors = colorClasses[recommendation.color] || colorClasses.blue;
</script>

<Card class="overflow-hidden border-2 {colors.border}">
	<div class="p-4 sm:p-5 {colors.bg}">
		<div class="flex items-start gap-3 sm:gap-4">
			<div class="flex-shrink-0 p-2.5 sm:p-3 rounded-xl bg-gradient-to-br {colors.icon} shadow-lg">
				<svelte:component this={recommendation.icon} class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
			</div>
			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2 mb-1">
					<span class="text-[10px] sm:text-xs font-bold uppercase tracking-wider {colors.badge} px-2 py-0.5 rounded-full">
						Next Workout
					</span>
				</div>
				<h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
					{recommendation.title}
				</h3>
				<p class="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
					{recommendation.message}
				</p>
				{#if recommendation.detail}
					<p class="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
						{recommendation.detail}
					</p>
				{/if}
			</div>
		</div>
	</div>
</Card>
