export interface Tip {
	id: string;
	category: 'motivation' | 'technique' | 'recovery' | 'nutrition' | 'progress';
	title: string;
	message: string;
	icon: string;
}

export const tips: Tip[] = [
	// Progress tips
	{
		id: 'progressive-overload',
		category: 'progress',
		title: 'Progressive Overload',
		message: 'To build strength, gradually increase weight, reps, or sets over time. Even small increments of 2.5-5 lbs make a difference!',
		icon: 'trending-up'
	},
	{
		id: 'consistency-key',
		category: 'progress',
		title: 'Consistency is Key',
		message: 'Showing up regularly matters more than perfect workouts. Aim for 3-4 sessions per week to see steady progress.',
		icon: 'calendar-check'
	},
	{
		id: 'track-progress',
		category: 'progress',
		title: 'Track Your Progress',
		message: 'Recording your workouts helps identify patterns and keeps you accountable. You\'re already doing great by using this app!',
		icon: 'clipboard-list'
	},
	{
		id: 'plateau-breaker',
		category: 'progress',
		title: 'Breaking Plateaus',
		message: 'Hit a plateau? Try changing rep ranges, exercise order, or add a deload week. Your body adapts - keep it guessing!',
		icon: 'zap'
	},
	{
		id: 'raise-weights',
		category: 'progress',
		title: 'Time to Level Up!',
		message: 'If you can complete all your sets with good form, it\'s time to increase the weight. Challenge yourself!',
		icon: 'arrow-up-circle'
	},

	// Technique tips
	{
		id: 'form-first',
		category: 'technique',
		title: 'Form Over Ego',
		message: 'Perfect form with lighter weight beats sloppy form with heavy weight. Protect your joints and maximize muscle activation.',
		icon: 'shield-check'
	},
	{
		id: 'mind-muscle',
		category: 'technique',
		title: 'Mind-Muscle Connection',
		message: 'Focus on feeling the target muscle work during each rep. This mental focus can significantly improve your gains.',
		icon: 'brain'
	},
	{
		id: 'controlled-tempo',
		category: 'technique',
		title: 'Control the Weight',
		message: 'Use a controlled tempo: 2-3 seconds on the eccentric (lowering) phase builds more muscle and reduces injury risk.',
		icon: 'clock'
	},
	{
		id: 'full-rom',
		category: 'technique',
		title: 'Full Range of Motion',
		message: 'Train through the full range of motion for better flexibility, joint health, and complete muscle development.',
		icon: 'maximize'
	},
	{
		id: 'breathing',
		category: 'technique',
		title: 'Breathe Right',
		message: 'Exhale during the exertion (lifting) phase, inhale during the lowering phase. Never hold your breath!',
		icon: 'wind'
	},

	// Recovery tips
	{
		id: 'rest-days',
		category: 'recovery',
		title: 'Rest Days Matter',
		message: 'Muscles grow during rest, not during workouts. Take 1-2 rest days per week for optimal recovery and growth.',
		icon: 'moon'
	},
	{
		id: 'sleep-gains',
		category: 'recovery',
		title: 'Sleep for Gains',
		message: 'Aim for 7-9 hours of quality sleep. Growth hormone peaks during deep sleep - it\'s when the magic happens!',
		icon: 'bed'
	},
	{
		id: 'stretch-it',
		category: 'recovery',
		title: 'Stretch It Out',
		message: 'Spend 5-10 minutes stretching after your workout. It improves flexibility and can reduce next-day soreness.',
		icon: 'activity'
	},
	{
		id: 'listen-body',
		category: 'recovery',
		title: 'Listen to Your Body',
		message: 'Sharp pain is a warning sign. Distinguish between good muscle burn and bad joint pain. When in doubt, rest.',
		icon: 'heart-pulse'
	},

	// Nutrition tips
	{
		id: 'protein-intake',
		category: 'nutrition',
		title: 'Protein Power',
		message: 'Aim for 0.7-1g of protein per pound of bodyweight daily. Spread intake across meals for optimal absorption.',
		icon: 'egg'
	},
	{
		id: 'hydration',
		category: 'nutrition',
		title: 'Stay Hydrated',
		message: 'Dehydration hurts performance. Drink water before, during, and after workouts. Aim for half your bodyweight in ounces daily.',
		icon: 'droplet'
	},
	{
		id: 'pre-workout-fuel',
		category: 'nutrition',
		title: 'Fuel Your Workout',
		message: 'Eat a balanced meal 2-3 hours before training, or a light snack 30-60 minutes before for energy.',
		icon: 'utensils'
	},

	// Motivation tips
	{
		id: 'celebrate-wins',
		category: 'motivation',
		title: 'Celebrate Small Wins',
		message: 'Every workout completed is a victory. You showed up - that\'s more than most people do!',
		icon: 'trophy'
	},
	{
		id: 'long-game',
		category: 'motivation',
		title: 'Play the Long Game',
		message: 'Fitness is a marathon, not a sprint. Focus on being 1% better each week rather than overnight transformations.',
		icon: 'target'
	},
	{
		id: 'compare-yourself',
		category: 'motivation',
		title: 'Your Only Competition',
		message: 'Compare yourself only to who you were yesterday. Everyone\'s fitness journey is unique.',
		icon: 'user'
	},
	{
		id: 'bad-workout',
		category: 'motivation',
		title: 'No Bad Workouts',
		message: 'A bad workout is still better than no workout. Some days you won\'t feel strong - show up anyway.',
		icon: 'thumbs-up'
	},
	{
		id: 'easing-back',
		category: 'motivation',
		title: 'Welcome Back!',
		message: 'Easing back into exercise? A month of building the habit is amazing progress. Now it\'s time to push a little harder!',
		icon: 'rocket'
	}
];

export function getRandomTip(): Tip {
	return tips[Math.floor(Math.random() * tips.length)];
}

export function getTipsByCategory(category: Tip['category']): Tip[] {
	return tips.filter(tip => tip.category === category);
}

export function getContextualTip(stats: {
	totalWorkouts: number;
	streak: number;
	recentVolumeChange?: number;
}): Tip {
	// Return contextual tips based on user's stats
	if (stats.totalWorkouts < 5) {
		return tips.find(t => t.id === 'celebrate-wins')!;
	}
	if (stats.streak >= 4) {
		return tips.find(t => t.id === 'raise-weights')!;
	}
	if (stats.totalWorkouts >= 10 && stats.totalWorkouts < 20) {
		return tips.find(t => t.id === 'easing-back')!;
	}
	if (stats.recentVolumeChange && stats.recentVolumeChange < 0) {
		return tips.find(t => t.id === 'listen-body')!;
	}
	return getRandomTip();
}
