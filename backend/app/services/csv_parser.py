import pandas as pd
from datetime import datetime
from io import StringIO
from sqlalchemy.orm import Session
from ..models import Workout, Exercise, Set
from ..schemas import UploadResult


EXERCISE_CATEGORIES = {
    "Leg Press": "legs",
    "Leg Extension (Machine)": "legs",
    "Seated Row (Machine)": "back",
    "Lat Pulldown (Machine)": "back",
    "Shoulder Press (Machine)": "shoulders",
    "Torso Rotation (Machine)": "core",
    "Back Extension (Machine)": "core",
    "Elliptical Machine": "cardio",
}


def parse_duration(duration_str: str) -> int:
    if pd.isna(duration_str) or not duration_str:
        return 0
    duration_str = str(duration_str).strip()
    if duration_str.endswith("m"):
        return int(duration_str[:-1])
    return int(duration_str) if duration_str.isdigit() else 0


def parse_csv_data(csv_content: str, db: Session) -> UploadResult:
    df = pd.read_csv(StringIO(csv_content))

    workouts_created = 0
    sets_created = 0
    exercises_created = 0
    duplicates_skipped = 0

    exercise_cache = {}
    for exercise in db.query(Exercise).all():
        exercise_cache[exercise.name] = exercise

    workout_cache = {}
    for workout in db.query(Workout).all():
        key = (workout.date, workout.name)
        workout_cache[key] = workout

    existing_sets = set()
    for s in db.query(Set).all():
        workout = s.workout
        exercise = s.exercise
        key = (workout.date, exercise.name, s.set_order)
        existing_sets.add(key)

    for _, row in df.iterrows():
        date_str = row["Date"]
        date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
        workout_name = row["Workout Name"].strip()
        duration = parse_duration(row["Duration"])
        exercise_name = row["Exercise Name"].strip()
        set_order = str(row["Set Order"]) if pd.notna(row["Set Order"]) else None

        set_key = (date, exercise_name, set_order)
        if set_key in existing_sets:
            duplicates_skipped += 1
            continue

        if exercise_name not in exercise_cache:
            category = EXERCISE_CATEGORIES.get(exercise_name, "other")
            exercise = Exercise(name=exercise_name, category=category)
            db.add(exercise)
            db.flush()
            exercise_cache[exercise_name] = exercise
            exercises_created += 1

        workout_key = (date, workout_name)
        if workout_key not in workout_cache:
            workout = Workout(date=date, name=workout_name, duration_minutes=duration)
            db.add(workout)
            db.flush()
            workout_cache[workout_key] = workout
            workouts_created += 1

        workout = workout_cache[workout_key]
        exercise = exercise_cache[exercise_name]

        weight = float(row["Weight"]) if pd.notna(row["Weight"]) and row["Weight"] != 0 else None
        reps = float(row["Reps"]) if pd.notna(row["Reps"]) and row["Reps"] != 0 else None
        distance = float(row["Distance"]) if pd.notna(row["Distance"]) and row["Distance"] != 0 else None
        seconds = float(row["Seconds"]) if pd.notna(row["Seconds"]) and row["Seconds"] != 0 else None
        rpe = int(row["RPE"]) if pd.notna(row["RPE"]) and str(row["RPE"]).strip() != "" else None

        new_set = Set(
            workout_id=workout.id,
            exercise_id=exercise.id,
            set_order=set_order,
            weight_lbs=weight,
            reps=reps,
            distance=distance,
            seconds=seconds,
            rpe=rpe,
        )
        db.add(new_set)
        existing_sets.add(set_key)
        sets_created += 1

    db.commit()

    return UploadResult(
        workouts_created=workouts_created,
        sets_created=sets_created,
        exercises_created=exercises_created,
        duplicates_skipped=duplicates_skipped,
    )
