import type {
	KPIStats,
	VolumeDataPoint,
	CategoryVolume,
	CardioDataPoint,
	ExercisePRSummary,
	WorkoutSummary,
	WorkoutWithSets,
	Exercise,
	ExerciseProgress,
	ExercisePR,
	UploadResult
} from './types';
import { get } from 'svelte/store';
import { yearFilter } from './stores/yearFilter';

// Use /api prefix - proxied to backend by SvelteKit server
const API_URL = '/api';

function isInYear(dateStr: string): boolean {
	const year = get(yearFilter);
	if (year === null) return true;
	return new Date(dateStr).getFullYear() === year;
}

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
	// Fetch all data and calculate KPIs for filtered year only
	const [workouts, volumeData] = await Promise.all([
		getWorkouts(0, 1000),
		fetchApi<VolumeDataPoint[]>('/stats/volume')
	]);

	const filteredWorkouts = workouts.filter(w => isInYear(w.date));
	const filteredVolume = volumeData.filter(v => isInYear(v.date));

	const totalVolume = filteredVolume.reduce((sum, v) => sum + v.volume, 0);
	const avgDuration = filteredWorkouts.length > 0
		? filteredWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / filteredWorkouts.length
		: 0;

	// Calculate streak (weeks with workouts)
	let streak = 0;
	if (filteredWorkouts.length > 0) {
		const workoutDates = filteredWorkouts.map(w => new Date(w.date));
		const today = new Date();
		const currentWeekStart = new Date(today);
		currentWeekStart.setDate(today.getDate() - today.getDay());

		const weeksWithWorkouts = new Set<string>();
		for (const date of workoutDates) {
			const weekStart = new Date(date);
			weekStart.setDate(date.getDate() - date.getDay());
			weeksWithWorkouts.add(weekStart.toISOString().split('T')[0]);
		}

		let week = currentWeekStart;
		while (weeksWithWorkouts.has(week.toISOString().split('T')[0])) {
			streak++;
			week.setDate(week.getDate() - 7);
		}
	}

	return {
		total_workouts: filteredWorkouts.length,
		current_streak: streak,
		total_volume: totalVolume,
		avg_duration: avgDuration
	};
}

export async function getVolumeStats(): Promise<VolumeDataPoint[]> {
	const data = await fetchApi<VolumeDataPoint[]>('/stats/volume');
	return data.filter(v => isInYear(v.date));
}

export async function getCategoryStats(): Promise<CategoryVolume[]> {
	// Need to recalculate from filtered workouts
	const workouts = await getWorkouts(0, 1000);
	const filteredWorkouts = workouts.filter(w => isInYear(w.date));

	// Fetch details for each workout to get exercise categories
	const details = await Promise.all(
		filteredWorkouts.map(w => getWorkout(w.id))
	);

	const categoryVolume: Record<string, number> = {};

	for (const workout of details) {
		for (const set of workout.sets) {
			const category = set.exercise?.category || 'other';
			if (category === 'cardio') continue;

			const volume = (set.weight_lbs || 0) * (set.reps || 0);
			categoryVolume[category] = (categoryVolume[category] || 0) + volume;
		}
	}

	return Object.entries(categoryVolume).map(([category, volume]) => ({
		category,
		volume
	}));
}

export async function getWorkouts(
	skip = 0,
	limit = 20,
	startDate?: string,
	endDate?: string
): Promise<WorkoutSummary[]> {
	const params = new URLSearchParams();
	params.append('skip', '0');
	params.append('limit', '1000'); // Fetch all to filter
	if (startDate) params.append('start_date', startDate);
	if (endDate) params.append('end_date', endDate);

	const data = await fetchApi<WorkoutSummary[]>(`/workouts?${params}`);
	const filtered = data.filter(w => isInYear(w.date));

	// Apply skip and limit after filtering
	return filtered.slice(skip, skip + limit);
}

export async function getWorkout(id: number): Promise<WorkoutWithSets> {
	return fetchApi<WorkoutWithSets>(`/workouts/${id}`);
}

export async function getExercises(): Promise<Exercise[]> {
	return fetchApi<Exercise[]>('/exercises');
}

export async function getExerciseProgress(exerciseId: number): Promise<ExerciseProgress[]> {
	const data = await fetchApi<ExerciseProgress[]>(`/exercises/${exerciseId}/progress`);
	return data.filter(p => isInYear(p.date));
}

export async function getExercisePRs(exerciseId: number): Promise<ExercisePR> {
	// Recalculate PRs from filtered progress data
	const progress = await getExerciseProgress(exerciseId);

	if (progress.length === 0) {
		return {
			best_weight: 0,
			best_volume: 0,
			best_reps: 0,
			best_estimated_1rm: 0
		};
	}

	const bestWeight = Math.max(...progress.map(p => p.best_weight));
	const bestVolume = Math.max(...progress.map(p => p.best_volume));

	// Fetch workout details to get best reps
	const workouts = await getWorkouts(0, 1000);
	const details = await Promise.all(workouts.map(w => getWorkout(w.id)));

	let bestReps = 0;
	let best1RM = 0;

	for (const workout of details) {
		for (const set of workout.sets) {
			if (set.exercise_id === exerciseId) {
				if (set.reps && set.reps > bestReps) {
					bestReps = set.reps;
				}
				if (set.weight_lbs && set.reps) {
					const estimated1RM = set.weight_lbs * (1 + set.reps / 30);
					if (estimated1RM > best1RM) {
						best1RM = estimated1RM;
					}
				}
			}
		}
	}

	return {
		best_weight: bestWeight,
		best_volume: bestVolume,
		best_reps: bestReps,
		best_estimated_1rm: best1RM
	};
}

export async function getAllPRs(): Promise<ExercisePRSummary[]> {
	return fetchApi<ExercisePRSummary[]>('/stats/prs');
}

export async function getCardioStats(): Promise<CardioDataPoint[]> {
	const data = await fetchApi<CardioDataPoint[]>('/stats/cardio');
	return data.filter(d => isInYear(d.date));
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
