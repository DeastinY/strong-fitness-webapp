<script lang="ts">
	import Card from '../ui/Card.svelte';

	export let title: string;
	export let value: string | number;
	export let subtitle: string = '';
	export let icon: any = null;
	export let color: 'blue' | 'orange' | 'green' | 'purple' = 'blue';

	const colorClasses = {
		blue: 'from-blue-500 to-blue-600 shadow-blue-500/25',
		orange: 'from-orange-500 to-orange-600 shadow-orange-500/25',
		green: 'from-green-500 to-green-600 shadow-green-500/25',
		purple: 'from-purple-500 to-purple-600 shadow-purple-500/25'
	};
</script>

<Card class="p-4 sm:p-6 group">
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0 flex-1">
			<p class="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
			<p class="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
			{#if subtitle}
				<p class="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
			{/if}
		</div>
		{#if icon}
			<div class="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br {colorClasses[color]} shadow-lg group-hover:scale-110 transition-transform duration-200">
				<svelte:component this={icon} class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
			</div>
		{/if}
	</div>
</Card>
