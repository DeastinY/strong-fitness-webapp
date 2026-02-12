<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import { Sun, Moon } from 'lucide-svelte';
</script>

<button
	on:click={() => theme.toggle()}
	class="p-2 rounded-lg transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
	aria-label="Toggle dark mode"
>
	{#if $theme === 'dark'}
		<Sun class="w-5 h-5 text-yellow-500" />
	{:else}
		<Moon class="w-5 h-5 text-gray-600" />
	{/if}
</button>
