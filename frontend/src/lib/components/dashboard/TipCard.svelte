<script lang="ts">
	import type { Tip } from '$lib/tips';
	import Card from '../ui/Card.svelte';
	import {
		TrendingUp,
		CalendarCheck,
		ClipboardList,
		Zap,
		ArrowUpCircle,
		ShieldCheck,
		Brain,
		Clock,
		Maximize,
		Wind,
		Moon,
		Bed,
		Activity,
		HeartPulse,
		Egg,
		Droplet,
		Utensils,
		Trophy,
		Target,
		User,
		ThumbsUp,
		Rocket,
		Lightbulb
	} from 'lucide-svelte';

	export let tip: Tip;

	const iconMap: Record<string, any> = {
		'trending-up': TrendingUp,
		'calendar-check': CalendarCheck,
		'clipboard-list': ClipboardList,
		'zap': Zap,
		'arrow-up-circle': ArrowUpCircle,
		'shield-check': ShieldCheck,
		'brain': Brain,
		'clock': Clock,
		'maximize': Maximize,
		'wind': Wind,
		'moon': Moon,
		'bed': Bed,
		'activity': Activity,
		'heart-pulse': HeartPulse,
		'egg': Egg,
		'droplet': Droplet,
		'utensils': Utensils,
		'trophy': Trophy,
		'target': Target,
		'user': User,
		'thumbs-up': ThumbsUp,
		'rocket': Rocket
	};

	const categoryColors: Record<string, { bg: string; border: string; icon: string }> = {
		motivation: { bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-700', icon: 'text-amber-600 dark:text-amber-400' },
		technique: { bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-700', icon: 'text-blue-600 dark:text-blue-400' },
		recovery: { bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-700', icon: 'text-purple-600 dark:text-purple-400' },
		nutrition: { bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-700', icon: 'text-green-600 dark:text-green-400' },
		progress: { bg: 'bg-rose-50 dark:bg-rose-900/30', border: 'border-rose-200 dark:border-rose-700', icon: 'text-rose-600 dark:text-rose-400' }
	};

	$: colors = categoryColors[tip.category] || categoryColors.motivation;
	$: IconComponent = iconMap[tip.icon] || Lightbulb;
</script>

<Card class="overflow-hidden">
	<div class="flex items-start gap-4 p-6 {colors.bg} border-l-4 {colors.border}">
		<div class="flex-shrink-0 p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm">
			<svelte:component this={IconComponent} class="w-6 h-6 {colors.icon}" />
		</div>
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 mb-1">
				<span class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
					{tip.category}
				</span>
			</div>
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{tip.title}</h3>
			<p class="text-gray-600 dark:text-gray-300 leading-relaxed">{tip.message}</p>
		</div>
	</div>
</Card>
