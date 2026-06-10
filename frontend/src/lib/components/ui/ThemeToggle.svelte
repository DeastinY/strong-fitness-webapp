<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import { Sun, Moon } from 'lucide-svelte';
</script>

<button
	on:click={() => theme.toggle()}
	class="p-2.5 rounded-xl transition-all duration-200 bg-amber-50 hover:bg-amber-100 dark:bg-[#2a2018] dark:hover:bg-[#352920] active:scale-95"
	aria-label="Toggle dark mode"
>
	{#if $theme === 'dark'}
		<Sun class="w-5 h-5 text-amber-300" />
	{:else}
		<Moon class="w-5 h-5 text-amber-700" />
	{/if}
</button>
