<script lang="ts">
	import Card from '../ui/Card.svelte';

	export let title: string;
	export let value: string | number;
	export let subtitle: string = '';
	export let icon: any = null;
</script>

<Card class="p-6">
	<div class="flex items-start justify-between">
		<div>
			<p class="text-sm font-medium text-gray-500">{title}</p>
			<p class="mt-2 text-3xl font-bold text-gray-900">{value}</p>
			{#if subtitle}
				<p class="mt-1 text-sm text-gray-500">{subtitle}</p>
			{/if}
		</div>
		{#if icon}
			<div class="p-3 bg-blue-50 rounded-lg">
				<svelte:component this={icon} class="w-6 h-6 text-blue-600" />
			</div>
		{/if}
	</div>
</Card>
