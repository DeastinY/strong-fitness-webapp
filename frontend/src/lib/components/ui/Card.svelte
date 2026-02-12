<script lang="ts">
	let className = '';
	export { className as class };
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 {className}">
	<slot />
</div>
