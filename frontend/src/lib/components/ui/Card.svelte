<script lang="ts">
	let className = '';
	export { className as class };
</script>

<div class="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-none {className}">
	<slot />
</div>
