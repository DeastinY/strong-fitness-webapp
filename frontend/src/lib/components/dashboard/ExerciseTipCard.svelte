<script lang="ts">
	import type { ExerciseTip } from '$lib/exerciseTips';
	import Card from '../ui/Card.svelte';
	import { Lightbulb, CheckCircle, AlertTriangle } from 'lucide-svelte';

	export let tip: ExerciseTip;

	let activeTab: 'tips' | 'form' | 'mistakes' = 'tips';
</script>

<Card class="overflow-hidden">
	<div class="border-b border-gray-200 dark:border-gray-700">
		<div class="flex">
			<button
				class="flex-1 px-4 py-3 text-sm font-medium transition-colors {activeTab === 'tips'
					? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
					: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}"
				on:click={() => (activeTab = 'tips')}
			>
				<span class="flex items-center justify-center gap-2">
					<Lightbulb class="w-4 h-4" />
					Tips
				</span>
			</button>
			<button
				class="flex-1 px-4 py-3 text-sm font-medium transition-colors {activeTab === 'form'
					? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/30'
					: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}"
				on:click={() => (activeTab = 'form')}
			>
				<span class="flex items-center justify-center gap-2">
					<CheckCircle class="w-4 h-4" />
					Form Cues
				</span>
			</button>
			<button
				class="flex-1 px-4 py-3 text-sm font-medium transition-colors {activeTab === 'mistakes'
					? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/30'
					: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}"
				on:click={() => (activeTab = 'mistakes')}
			>
				<span class="flex items-center justify-center gap-2">
					<AlertTriangle class="w-4 h-4" />
					Avoid
				</span>
			</button>
		</div>
	</div>

	<div class="p-6">
		{#if activeTab === 'tips'}
			<ul class="space-y-3">
				{#each tip.tips as item}
					<li class="flex items-start gap-3">
						<div class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mt-0.5">
							<Lightbulb class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
						</div>
						<span class="text-gray-700 dark:text-gray-300">{item}</span>
					</li>
				{/each}
			</ul>
		{:else if activeTab === 'form'}
			<ul class="space-y-3">
				{#each tip.formCues as item}
					<li class="flex items-start gap-3">
						<div class="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mt-0.5">
							<CheckCircle class="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
						</div>
						<span class="text-gray-700 dark:text-gray-300">{item}</span>
					</li>
				{/each}
			</ul>
		{:else}
			<ul class="space-y-3">
				{#each tip.commonMistakes as item}
					<li class="flex items-start gap-3">
						<div class="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mt-0.5">
							<AlertTriangle class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
						</div>
						<span class="text-gray-700 dark:text-gray-300">{item}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</Card>
