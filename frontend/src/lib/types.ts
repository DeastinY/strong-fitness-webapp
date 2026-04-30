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
	avg_rpe: number | null;
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

export interface ExercisePRSummary {
	exercise_id: number;
	exercise_name: string;
	best_weight: number;
	best_reps: number;
	best_estimated_1rm: number;
	best_weight_date: string | null;
}

export interface CardioDataPoint {
	date: string;
	distance_km: number;
	seconds: number;
}

export interface UploadResult {
	workouts_created: number;
	sets_created: number;
	exercises_created: number;
	duplicates_skipped: number;
}

export type Unit = 'lbs' | 'kg';

export interface ReportOverview {
	total_workouts: number;
	total_volume_lbs: number;
	avg_duration_minutes: number;
	avg_workouts_per_week: number;
	total_sets: number;
	unique_exercises: number;
}

export interface ReportMonthlyBreakdown {
	label: string;
	count: number;
}

export interface ReportDayOfWeek {
	day: string;
	count: number;
}

export interface ReportAttendance {
	workout_dates: string[];
	monthly_breakdown: ReportMonthlyBreakdown[];
	day_of_week: ReportDayOfWeek[];
}

export interface ReportSet {
	set_order: string;
	weight_lbs: number | null;
	reps: number | null;
	distance: number | null;
	seconds: number | null;
	rpe: number | null;
}

export interface ReportSession {
	date: string;
	sets: ReportSet[];
}

export interface ReportExercise {
	id: number;
	name: string;
	category: string | null;
	progress: ExerciseProgress[];
	sessions: ReportSession[];
	pr: ExercisePR;
}

export interface ReportData {
	generated_at: string;
	date_from: string;
	date_to: string;
	overview: ReportOverview;
	attendance: ReportAttendance;
	exercises: ReportExercise[];
}
