import type {
	KPIStats,
	VolumeDataPoint,
	CategoryVolume,
	WorkoutSummary,
	WorkoutWithSets,
	Exercise,
	ExerciseProgress,
	ExercisePR,
	UploadResult
} from './types';

const API_URL = typeof window !== 'undefined'
	? (window as unknown as { ENV?: { PUBLIC_API_URL?: string } }).ENV?.PUBLIC_API_URL || 'http://localhost:8000'
	: 'http://localhost:8000';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
	const response = await fetch(`${API_URL}${endpoint}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options?.headers
		}
	});

	if (!response.ok) {
		throw new Error(`API error: ${response.status}`);
	}

	return response.json();
}

export async function getKPIStats(): Promise<KPIStats> {
	return fetchApi<KPIStats>('/stats/kpi');
}

export async function getVolumeStats(): Promise<VolumeDataPoint[]> {
	return fetchApi<VolumeDataPoint[]>('/stats/volume');
}

export async function getCategoryStats(): Promise<CategoryVolume[]> {
	return fetchApi<CategoryVolume[]>('/stats/categories');
}

export async function getWorkouts(
	skip = 0,
	limit = 20,
	startDate?: string,
	endDate?: string
): Promise<WorkoutSummary[]> {
	const params = new URLSearchParams();
	params.append('skip', skip.toString());
	params.append('limit', limit.toString());
	if (startDate) params.append('start_date', startDate);
	if (endDate) params.append('end_date', endDate);

	return fetchApi<WorkoutSummary[]>(`/workouts?${params}`);
}

export async function getWorkout(id: number): Promise<WorkoutWithSets> {
	return fetchApi<WorkoutWithSets>(`/workouts/${id}`);
}

export async function getExercises(): Promise<Exercise[]> {
	return fetchApi<Exercise[]>('/exercises');
}

export async function getExerciseProgress(exerciseId: number): Promise<ExerciseProgress[]> {
	return fetchApi<ExerciseProgress[]>(`/exercises/${exerciseId}/progress`);
}

export async function getExercisePRs(exerciseId: number): Promise<ExercisePR> {
	return fetchApi<ExercisePR>(`/exercises/${exerciseId}/prs`);
}

export async function uploadCSV(file: File): Promise<UploadResult> {
	const formData = new FormData();
	formData.append('file', file);

	const response = await fetch(`${API_URL}/upload`, {
		method: 'POST',
		body: formData
	});

	if (!response.ok) {
		throw new Error(`Upload failed: ${response.status}`);
	}

	return response.json();
}
