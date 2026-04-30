from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ExerciseBase(BaseModel):
    name: str
    category: Optional[str] = None


class ExerciseCreate(ExerciseBase):
    pass


class Exercise(ExerciseBase):
    id: int

    class Config:
        from_attributes = True


class SetBase(BaseModel):
    set_order: Optional[str] = None
    weight_lbs: Optional[float] = None
    reps: Optional[float] = None
    distance: Optional[float] = None
    seconds: Optional[float] = None
    rpe: Optional[int] = None


class SetCreate(SetBase):
    exercise_id: int


class Set(SetBase):
    id: int
    workout_id: int
    exercise_id: int
    volume: float

    class Config:
        from_attributes = True


class SetWithExercise(Set):
    exercise: Exercise


class WorkoutBase(BaseModel):
    name: str
    duration_minutes: Optional[int] = None


class WorkoutCreate(WorkoutBase):
    date: datetime


class Workout(WorkoutBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True


class WorkoutWithSets(Workout):
    sets: list[SetWithExercise] = []


class WorkoutSummary(Workout):
    total_volume: float
    exercise_count: int
    set_count: int


class KPIStats(BaseModel):
    total_workouts: int
    current_streak: int
    total_volume: float
    avg_duration: float


class VolumeDataPoint(BaseModel):
    date: datetime
    volume: float


class ExerciseProgress(BaseModel):
    date: datetime
    best_weight: float
    best_volume: float
    total_volume: float
    avg_rpe: Optional[float] = None


class ExercisePR(BaseModel):
    best_weight: float
    best_volume: float
    best_reps: float
    best_estimated_1rm: float


class CategoryVolume(BaseModel):
    category: str
    volume: float


class ExercisePRSummary(BaseModel):
    exercise_id: int
    exercise_name: str
    best_weight: float
    best_reps: float
    best_estimated_1rm: float
    best_weight_date: Optional[datetime] = None


class CardioDataPoint(BaseModel):
    date: datetime
    distance_km: float
    seconds: float


class UploadResult(BaseModel):
    workouts_created: int
    sets_created: int
    exercises_created: int
    duplicates_skipped: int


class ReportOverview(BaseModel):
    total_workouts: int
    total_volume_lbs: float
    avg_duration_minutes: float
    avg_workouts_per_week: float
    total_sets: int
    unique_exercises: int


class ReportMonthlyBreakdown(BaseModel):
    label: str
    count: int


class ReportDayOfWeek(BaseModel):
    day: str
    count: int


class ReportAttendance(BaseModel):
    workout_dates: list[str]
    monthly_breakdown: list[ReportMonthlyBreakdown]
    day_of_week: list[ReportDayOfWeek]


class ReportSet(BaseModel):
    set_order: str
    weight_lbs: Optional[float]
    reps: Optional[float]
    distance: Optional[float]
    seconds: Optional[float]
    rpe: Optional[int]


class ReportSession(BaseModel):
    date: datetime
    sets: list[ReportSet]


class ReportExercise(BaseModel):
    id: int
    name: str
    category: Optional[str]
    progress: list[ExerciseProgress]
    sessions: list[ReportSession]
    pr: ExercisePR


class ReportData(BaseModel):
    generated_at: datetime
    date_from: datetime
    date_to: datetime
    overview: ReportOverview
    attendance: ReportAttendance
    exercises: list[ReportExercise]


# keep schemas importable for analytics
__all__ = [
    "ReportSet", "ReportSession", "ReportExercise",
    "ReportOverview", "ReportAttendance", "ReportMonthlyBreakdown",
    "ReportDayOfWeek", "ReportData",
]
