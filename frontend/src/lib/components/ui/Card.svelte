<script lang="ts">
	let className = '';
	export { className as class };
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200 {className}">
	<slot />
</div>
