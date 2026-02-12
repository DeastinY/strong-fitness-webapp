<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Dumbbell, Home, History, LineChart, Upload } from 'lucide-svelte';
	import { theme } from '$lib/stores/theme';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: Home },
		{ href: '/workouts', label: 'Workouts', icon: History },
		{ href: '/exercises', label: 'Exercises', icon: LineChart },
		{ href: '/upload', label: 'Upload', icon: Upload }
	];

	onMount(() => {
		theme.init();
	});
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
	<nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex items-center">
					<a href="/" class="flex items-center gap-2">
						<Dumbbell class="w-8 h-8 text-blue-600 dark:text-blue-400" />
						<span class="text-xl font-bold text-gray-900 dark:text-white">Fitness Tracker</span>
					</a>
				</div>
				<div class="flex items-center gap-1">
					{#each navItems as item}
						<a
							href={item.href}
							class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors {$page
								.url.pathname === item.href
								? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
								: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}"
						>
							<svelte:component this={item.icon} class="w-4 h-4" />
							<span class="hidden sm:inline">{item.label}</span>
						</a>
					{/each}
					<div class="ml-2">
						<ThemeToggle />
					</div>
				</div>
			</div>
		</div>
	</nav>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<slot />
	</main>
</div>
