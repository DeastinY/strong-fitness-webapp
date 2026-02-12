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


class ExercisePR(BaseModel):
    best_weight: float
    best_volume: float
    best_reps: float
    best_estimated_1rm: float


class CategoryVolume(BaseModel):
    category: str
    volume: float


class UploadResult(BaseModel):
    workouts_created: int
    sets_created: int
    exercises_created: int
    duplicates_skipped: int
