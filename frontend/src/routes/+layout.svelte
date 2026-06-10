<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Dumbbell, Home, History, LineChart, Upload, Menu, X, Trophy, FileText } from 'lucide-svelte';
	import { theme } from '$lib/stores/theme';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';

	const navItems = [
		{ href: '/', label: 'Command Deck', icon: Home },
		{ href: '/workouts', label: 'Session Log', icon: History },
		{ href: '/exercises', label: 'Lift Theater', icon: LineChart },
		{ href: '/records', label: 'Record Vault', icon: Trophy },
		{ href: '/report', label: 'Story Report', icon: FileText },
		{ href: '/upload', label: 'Data Ingest', icon: Upload }
	];

	let mobileMenuOpen = false;

	onMount(() => {
		theme.init();
	});

	$: if ($page.url.pathname) {
		mobileMenuOpen = false;
	}
</script>

<div class="performative-shell min-h-screen transition-colors">
	<nav class="performative-nav sticky top-0 z-40">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex items-center">
					<a href="/" class="flex items-center gap-2.5 group">
						<div class="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/45 transition-shadow">
							<Dumbbell class="w-5 h-5 text-white" />
						</div>
						<span class="text-lg font-bold bg-gradient-to-r from-orange-700 to-amber-600 dark:from-amber-300 dark:to-orange-300 bg-clip-text text-transparent">
							Strong Stage
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
								? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
								: 'text-amber-900/80 dark:text-amber-100/80 hover:bg-white/70 dark:hover:bg-orange-100/10 hover:text-amber-950 dark:hover:text-amber-50'}"
						>
							<svelte:component this={item.icon} class="w-4 h-4" />
							{item.label}
						</a>
					{/each}
					<div class="ml-2 pl-2 border-l border-orange-900/10 dark:border-orange-100/20">
						<ThemeToggle />
					</div>
				</div>

				<!-- Mobile menu button -->
				<div class="flex md:hidden items-center gap-2">
					<ThemeToggle />
					<button
						on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
						class="p-2 rounded-xl text-amber-800 dark:text-amber-100 hover:bg-white/70 dark:hover:bg-orange-100/10 transition-colors"
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
			<div class="md:hidden border-t border-orange-900/10 dark:border-orange-100/15 bg-white/90 dark:bg-[#1b1612]/90 backdrop-blur-lg">
				<div class="px-4 py-3 space-y-1">
					{#each navItems as item}
						<a
							href={item.href}
							class="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all {$page
								.url.pathname === item.href
								? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
								: 'text-amber-900/80 dark:text-amber-100/80 hover:bg-orange-50 dark:hover:bg-orange-100/10'}"
						>
							<svelte:component this={item.icon} class="w-5 h-5" />
							{item.label}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</nav>

	<main class="performative-main max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
		<slot />
	</main>
</div>
