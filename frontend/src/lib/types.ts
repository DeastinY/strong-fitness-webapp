export interface Exercise {
	id: number;
	name: string;
	category: string | null;
}

export interface Set {
	id: number;
	workout_id: number;
	exercise_id: number;
	set_order: string | null;
	weight_lbs: number | null;
	reps: number | null;
	distance: number | null;
	seconds: number | null;
	rpe: number | null;
	volume: number;
	exercise?: Exercise;
}

export interface Workout {
	id: number;
	date: string;
	name: string;
	duration_minutes: number | null;
}

export interface WorkoutWithSets extends Workout {
	sets: Set[];
}

export interface WorkoutSummary extends Workout {
	total_volume: number;
	exercise_count: number;
	set_count: number;
}

export interface KPIStats {
	total_workouts: number;
	current_streak: number;
	total_volume: number;
	avg_duration: number;
}

export interface VolumeDataPoint {
	date: string;
	volume: number;
}

export interface ExerciseProgress {
	date: string;
	best_weight: number;
	best_volume: number;
	total_volume: number;
}

export interface ExercisePR {
	best_weight: number;
	best_volume: number;
	best_reps: number;
	best_estimated_1rm: number;
}

export interface CategoryVolume {
	category: string;
	volume: number;
}

export interface UploadResult {
	workouts_created: number;
	sets_created: number;
	exercises_created: number;
	duplicates_skipped: number;
}

export type Unit = 'lbs' | 'kg';
