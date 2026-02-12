<script lang="ts">
	import type { UploadResult } from '$lib/types';
	import { uploadCSV } from '$lib/api';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-svelte';

	let file: File | null = null;
	let preview: string[] = [];
	let uploading = false;
	let result: UploadResult | null = null;
	let error: string | null = null;
	let dragOver = false;

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			selectFile(input.files[0]);
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
			selectFile(event.dataTransfer.files[0]);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	async function selectFile(selectedFile: File) {
		file = selectedFile;
		result = null;
		error = null;

		const text = await selectedFile.text();
		const lines = text.split('\n').slice(0, 6);
		preview = lines;
	}

	async function handleUpload() {
		if (!file) return;

		try {
			uploading = true;
			error = null;
			result = await uploadCSV(file);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Upload failed';
		} finally {
			uploading = false;
		}
	}

	function reset() {
		file = null;
		preview = [];
		result = null;
		error = null;
	}
</script>

<svelte:head>
	<title>Upload - Fitness Tracker</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Upload CSV</h1>

	{#if result}
		<Card class="p-6">
			<div class="text-center">
				<CheckCircle class="w-12 h-12 mx-auto mb-4 text-green-500" />
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Complete</h2>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
					<div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
						<p class="text-2xl font-bold text-gray-900 dark:text-white">{result.workouts_created}</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">Workouts Created</p>
					</div>
					<div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
						<p class="text-2xl font-bold text-gray-900 dark:text-white">{result.sets_created}</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">Sets Created</p>
					</div>
					<div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
						<p class="text-2xl font-bold text-gray-900 dark:text-white">{result.exercises_created}</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">Exercises Created</p>
					</div>
					<div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
						<p class="text-2xl font-bold text-gray-900 dark:text-white">{result.duplicates_skipped}</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">Duplicates Skipped</p>
					</div>
				</div>
				<div class="flex justify-center gap-4">
					<Button variant="secondary" on:click={reset}>Upload Another</Button>
					<Button on:click={() => window.location.href = '/'}>View Dashboard</Button>
				</div>
			</div>
		</Card>
	{:else}
		<Card class="p-6">
			<div
				class="border-2 border-dashed rounded-lg p-8 text-center transition-colors {dragOver
					? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
					: 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}"
				on:drop={handleDrop}
				on:dragover={handleDragOver}
				on:dragleave={handleDragLeave}
				role="button"
				tabindex="0"
			>
				{#if file}
					<FileText class="w-12 h-12 mx-auto mb-4 text-blue-500" />
					<p class="text-lg font-medium text-gray-900 dark:text-white">{file.name}</p>
					<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">{(file.size / 1024).toFixed(1)} KB</p>
					<Button variant="ghost" on:click={reset}>Choose Different File</Button>
				{:else}
					<Upload class="w-12 h-12 mx-auto mb-4 text-gray-400" />
					<p class="text-lg font-medium text-gray-900 dark:text-white mb-2">
						Drag and drop your CSV file here
					</p>
					<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">or</p>
					<label>
						<input
							type="file"
							accept=".csv"
							class="hidden"
							on:change={handleFileSelect}
						/>
						<span
							class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
						>
							Browse Files
						</span>
					</label>
				{/if}
			</div>
		</Card>

		{#if preview.length > 0}
			<Card class="p-6">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h2>
				<div class="overflow-x-auto">
					<pre class="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">{preview.join('\n')}</pre>
				</div>
				{#if preview.length >= 6}
					<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Showing first 5 rows...</p>
				{/if}
			</Card>

			{#if error}
				<div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
					<AlertCircle class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
					<div class="text-red-700 dark:text-red-400">{error}</div>
				</div>
			{/if}

			<div class="flex justify-end">
				<Button on:click={handleUpload} disabled={uploading}>
					{#if uploading}
						<span class="animate-spin mr-2">⏳</span>
						Uploading...
					{:else}
						<Upload class="w-4 h-4 mr-2" />
						Upload CSV
					{/if}
				</Button>
			</div>
		{/if}
	{/if}
</div>
