<script lang="ts">
	import type { CategoryVolume } from '$lib/types';

	export let data: CategoryVolume[] = [];

	const colors: Record<string, string> = {
		legs: '#ef4444',
		back: '#3b82f6',
		shoulders: '#22c55e',
		core: '#a855f7',
		chest: '#f97316',
		arms: '#ec4899'
	};

	function getColor(category: string): string {
		return colors[category] || '#6b7280';
	}

	// Reactive calculations
	$: totalVolume = data?.reduce((sum, d) => sum + d.volume, 0) || 0;

	$: volumeMap = data?.reduce((acc, d) => {
		acc[d.category] = totalVolume > 0 ? d.volume / totalVolume : 0;
		return acc;
	}, {} as Record<string, number>) || {};

	// Calculate opacities reactively based on volumeMap
	$: getOpacity = (category: string): number => {
		const percentage = volumeMap[category] || 0;
		return Math.max(0.2, Math.min(1, percentage * 2.5 + 0.3));
	};
</script>

{#if data && data.length > 0}
<div class="flex justify-center gap-6">
	<!-- Front View -->
	<div class="text-center">
		<p class="text-xs text-gray-500 mb-2 font-medium">Front</p>
		<svg viewBox="0 0 100 200" class="w-20 h-40">
			<!-- Head -->
			<ellipse cx="50" cy="18" rx="12" ry="14" fill="#e5e7eb" />

			<!-- Neck -->
			<rect x="45" y="30" width="10" height="8" fill="#e5e7eb" />

			<!-- Shoulders -->
			<path
				d="M30 38 Q50 32 70 38 L70 48 Q50 42 30 48 Z"
				fill={getColor('shoulders')}
				fill-opacity={getOpacity('shoulders')}
			/>

			<!-- Chest -->
			<path
				d="M32 48 Q50 44 68 48 L66 72 Q50 76 34 72 Z"
				fill={getColor('chest')}
				fill-opacity={getOpacity('chest')}
			/>

			<!-- Core / Abs -->
			<path
				d="M36 72 L64 72 L62 105 L38 105 Z"
				fill={getColor('core')}
				fill-opacity={getOpacity('core')}
			/>

			<!-- Left Upper Arm -->
			<path
				d="M30 48 L22 52 L20 78 L26 80 L28 56 L30 52 Z"
				fill={getColor('arms')}
				fill-opacity={getOpacity('arms')}
			/>
			<!-- Left Forearm -->
			<path
				d="M20 78 L16 108 L22 110 L26 80 Z"
				fill={getColor('arms')}
				fill-opacity={getOpacity('arms') * 0.7}
			/>

			<!-- Right Upper Arm -->
			<path
				d="M70 48 L78 52 L80 78 L74 80 L72 56 L70 52 Z"
				fill={getColor('arms')}
				fill-opacity={getOpacity('arms')}
			/>
			<!-- Right Forearm -->
			<path
				d="M80 78 L84 108 L78 110 L74 80 Z"
				fill={getColor('arms')}
				fill-opacity={getOpacity('arms') * 0.7}
			/>

			<!-- Left Thigh -->
			<path
				d="M38 105 L36 110 L34 150 L44 150 L46 110 L46 105 Z"
				fill={getColor('legs')}
				fill-opacity={getOpacity('legs')}
			/>
			<!-- Left Calf -->
			<path
				d="M34 150 L33 182 L43 185 L44 150 Z"
				fill={getColor('legs')}
				fill-opacity={getOpacity('legs') * 0.7}
			/>

			<!-- Right Thigh -->
			<path
				d="M62 105 L64 110 L66 150 L56 150 L54 110 L54 105 Z"
				fill={getColor('legs')}
				fill-opacity={getOpacity('legs')}
			/>
			<!-- Right Calf -->
			<path
				d="M66 150 L67 182 L57 185 L56 150 Z"
				fill={getColor('legs')}
				fill-opacity={getOpacity('legs') * 0.7}
			/>

			<!-- Body outline -->
			<path
				d="M50 32 Q32 36 30 48 L22 52 L16 112 L22 112 L28 56 L32 52
				   L34 72 L38 105 L34 150 L33 188 L43 190 L46 150 L50 110
				   L54 150 L57 190 L67 188 L66 150 L62 105 L66 72 L68 52
				   L72 56 L78 112 L84 112 L78 52 L70 48 Q68 36 50 32 Z"
				fill="none"
				stroke="#9ca3af"
				stroke-width="1.5"
			/>
		</svg>
	</div>

	<!-- Back View -->
	<div class="text-center">
		<p class="text-xs text-gray-500 mb-2 font-medium">Back</p>
		<svg viewBox="0 0 100 200" class="w-20 h-40">
			<!-- Head -->
			<ellipse cx="50" cy="18" rx="12" ry="14" fill="#e5e7eb" />

			<!-- Neck -->
			<rect x="45" y="30" width="10" height="8" fill="#e5e7eb" />

			<!-- Traps/Shoulders -->
			<path
				d="M28 38 Q50 30 72 38 L72 50 Q50 44 28 50 Z"
				fill={getColor('shoulders')}
				fill-opacity={getOpacity('shoulders')}
			/>

			<!-- Upper Back / Lats -->
			<path
				d="M30 50 Q50 46 70 50 L68 78 Q50 82 32 78 Z"
				fill={getColor('back')}
				fill-opacity={getOpacity('back')}
			/>

			<!-- Lower Back -->
			<path
				d="M36 78 L64 78 L62 105 L38 105 Z"
				fill={getColor('core')}
				fill-opacity={getOpacity('core') * 0.7}
			/>

			<!-- Left Upper Arm (tricep) -->
			<path
				d="M28 50 L20 54 L18 80 L24 82 L26 58 L28 54 Z"
				fill={getColor('arms')}
				fill-opacity={getOpacity('arms')}
			/>
			<!-- Left Forearm -->
			<path
				d="M18 80 L14 110 L20 112 L24 82 Z"
				fill={getColor('arms')}
				fill-opacity={getOpacity('arms') * 0.7}
			/>

			<!-- Right Upper Arm (tricep) -->
			<path
				d="M72 50 L80 54 L82 80 L76 82 L74 58 L72 54 Z"
				fill={getColor('arms')}
				fill-opacity={getOpacity('arms')}
			/>
			<!-- Right Forearm -->
			<path
				d="M82 80 L86 110 L80 112 L76 82 Z"
				fill={getColor('arms')}
				fill-opacity={getOpacity('arms') * 0.7}
			/>

			<!-- Glutes -->
			<ellipse cx="43" cy="112" rx="7" ry="5" fill={getColor('legs')} fill-opacity={getOpacity('legs') * 0.5} />
			<ellipse cx="57" cy="112" rx="7" ry="5" fill={getColor('legs')} fill-opacity={getOpacity('legs') * 0.5} />

			<!-- Left Hamstring -->
			<path
				d="M38 105 L36 110 L34 150 L44 150 L46 110 L46 105 Z"
				fill={getColor('legs')}
				fill-opacity={getOpacity('legs') * 0.85}
			/>
			<!-- Left Calf -->
			<path
				d="M34 150 L33 182 L43 185 L44 150 Z"
				fill={getColor('legs')}
				fill-opacity={getOpacity('legs') * 0.7}
			/>

			<!-- Right Hamstring -->
			<path
				d="M62 105 L64 110 L66 150 L56 150 L54 110 L54 105 Z"
				fill={getColor('legs')}
				fill-opacity={getOpacity('legs') * 0.85}
			/>
			<!-- Right Calf -->
			<path
				d="M66 150 L67 182 L57 185 L56 150 Z"
				fill={getColor('legs')}
				fill-opacity={getOpacity('legs') * 0.7}
			/>

			<!-- Body outline -->
			<path
				d="M50 32 Q30 36 28 50 L20 54 L14 114 L20 114 L26 58 L30 54
				   L32 78 L38 105 L34 150 L33 188 L43 190 L46 150 L50 110
				   L54 150 L57 190 L67 188 L66 150 L62 105 L68 78 L70 54
				   L74 58 L80 114 L86 114 L80 54 L72 50 Q70 36 50 32 Z"
				fill="none"
				stroke="#9ca3af"
				stroke-width="1.5"
			/>
		</svg>
	</div>
</div>

<!-- Legend -->
<div class="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
	{#each data as item}
		<div class="flex items-center gap-1.5">
			<div
				class="w-3 h-3 rounded-full"
				style="background-color: {getColor(item.category)}; opacity: {getOpacity(item.category)}"
			></div>
			<span class="text-xs text-gray-600 capitalize">{item.category}</span>
		</div>
	{/each}
</div>
{:else}
<div class="text-center text-gray-400 py-8">
	No muscle data available
</div>
{/if}
