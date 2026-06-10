<script lang="ts">
	let className = '';
	export { className as class };
</script>

<div class="bg-white/85 dark:bg-[#231b15]/72 rounded-2xl shadow-lg shadow-amber-900/10 dark:shadow-orange-950/20 border border-amber-900/10 dark:border-amber-100/10 backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:shadow-amber-900/15 dark:hover:shadow-orange-950/30 {className}">
	<slot />
</div>
