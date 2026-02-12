<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import { Sun, Moon } from 'lucide-svelte';
</script>

<button
	on:click={() => theme.toggle()}
	class="p-2.5 rounded-xl transition-all duration-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 active:scale-95"
	aria-label="Toggle dark mode"
>
	{#if $theme === 'dark'}
		<Sun class="w-5 h-5 text-amber-400" />
	{:else}
		<Moon class="w-5 h-5 text-gray-500" />
	{/if}
</button>
