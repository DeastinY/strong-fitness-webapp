<script lang="ts">
	export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let disabled = false;

	let className = '';
	export { className as class };

	const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]';

	const variantClasses = {
		primary: 'bg-gradient-to-b from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 focus-visible:ring-blue-500 dark:shadow-blue-500/10',
		secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
		ghost: 'text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-700'
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
