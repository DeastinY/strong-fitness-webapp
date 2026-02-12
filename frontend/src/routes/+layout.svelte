<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { Dumbbell, Home, History, LineChart, Upload } from 'lucide-svelte';

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: Home },
		{ href: '/workouts', label: 'Workouts', icon: History },
		{ href: '/exercises', label: 'Exercises', icon: LineChart },
		{ href: '/upload', label: 'Upload', icon: Upload }
	];
</script>

<div class="min-h-screen bg-gray-50">
	<nav class="bg-white border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex items-center">
					<a href="/" class="flex items-center gap-2">
						<Dumbbell class="w-8 h-8 text-blue-600" />
						<span class="text-xl font-bold text-gray-900">Fitness Tracker</span>
					</a>
				</div>
				<div class="flex items-center gap-1">
					{#each navItems as item}
						<a
							href={item.href}
							class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors {$page
								.url.pathname === item.href
								? 'bg-blue-50 text-blue-700'
								: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}"
						>
							<svelte:component this={item.icon} class="w-4 h-4" />
							{item.label}
						</a>
					{/each}
				</div>
			</div>
		</div>
	</nav>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<slot />
	</main>
</div>
