<script lang="ts">
	export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let disabled = false;

	let className = '';
	export { className as class };

	const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]';

	const variantClasses = {
		primary: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 focus-visible:ring-orange-500',
		secondary: 'bg-amber-50 text-amber-950 hover:bg-amber-100 focus-visible:ring-amber-600 dark:bg-[#2a2018] dark:text-amber-100 dark:hover:bg-[#34281f]',
		ghost: 'text-amber-900 hover:bg-amber-50 focus-visible:ring-amber-600 dark:text-amber-200 dark:hover:bg-[#2a2018]'
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm min-h-[32px]',
		md: 'px-4 py-2 text-sm min-h-[40px]',
		lg: 'px-6 py-3 text-base min-h-[48px]'
	};

	const disabledClasses = 'opacity-50 cursor-not-allowed active:scale-100';
</script>

<button
	class="{baseClasses} {variantClasses[variant]} {sizeClasses[size]} {disabled ? disabledClasses : ''} {className}"
	{disabled}
	on:click
>
	<slot />
</button>
