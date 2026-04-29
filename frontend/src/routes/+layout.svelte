<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Dumbbell, Home, History, LineChart, Upload, Menu, X, Trophy } from 'lucide-svelte';
	import { theme } from '$lib/stores/theme';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: Home },
		{ href: '/workouts', label: 'Workouts', icon: History },
		{ href: '/exercises', label: 'Exercises', icon: LineChart },
		{ href: '/records', label: 'Records', icon: Trophy },
		{ href: '/upload', label: 'Upload', icon: Upload }
	];

	let mobileMenuOpen = false;

	onMount(() => {
		theme.init();
	});

	$: if ($page.url.pathname) {
		mobileMenuOpen = false;
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors">
	<nav class="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex items-center">
					<a href="/" class="flex items-center gap-2.5 group">
						<div class="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
							<Dumbbell class="w-5 h-5 text-white" />
						</div>
						<span class="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
							Fitness
						</span>
					</a>
				</div>

				<!-- Desktop nav -->
				<div class="hidden md:flex items-center gap-1">
					{#each navItems as item}
						<a
							href={item.href}
							class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 {$page
								.url.pathname === item.href
								? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
								: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'}"
						>
							<svelte:component this={item.icon} class="w-4 h-4" />
							{item.label}
						</a>
					{/each}
					<div class="ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
						<ThemeToggle />
					</div>
				</div>

				<!-- Mobile menu button -->
				<div class="flex md:hidden items-center gap-2">
					<ThemeToggle />
					<button
						on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
						class="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					>
						{#if mobileMenuOpen}
							<X class="w-6 h-6" />
						{:else}
							<Menu class="w-6 h-6" />
						{/if}
					</button>
				</div>
			</div>
		</div>

		<!-- Mobile menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg">
				<div class="px-4 py-3 space-y-1">
					{#each navItems as item}
						<a
							href={item.href}
							class="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all {$page
								.url.pathname === item.href
								? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
								: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}"
						>
							<svelte:component this={item.icon} class="w-5 h-5" />
							{item.label}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</nav>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
		<slot />
	</main>
</div>
