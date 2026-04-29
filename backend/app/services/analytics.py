from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from ..models import Workout, Exercise, Set
from ..schemas import (
    KPIStats,
    VolumeDataPoint,
    ExerciseProgress,
    ExercisePR,
    ExercisePRSummary,
    CategoryVolume,
    CardioDataPoint,
)


def calculate_kpi_stats(db: Session) -> KPIStats:
    total_workouts = db.query(func.count(Workout.id)).scalar() or 0

    total_volume = (
        db.query(func.sum(Set.weight_lbs * Set.reps))
        .filter(Set.weight_lbs.isnot(None), Set.reps.isnot(None))
        .scalar()
        or 0
    )

    avg_duration = (
        db.query(func.avg(Workout.duration_minutes))
        .filter(Workout.duration_minutes.isnot(None))
        .scalar()
        or 0
    )

    current_streak = calculate_streak(db)

    return KPIStats(
        total_workouts=total_workouts,
        current_streak=current_streak,
        total_volume=round(total_volume, 2),
        avg_duration=round(avg_duration, 1),
    )


def calculate_streak(db: Session) -> int:
    workouts = (
        db.query(Workout.date)
        .order_by(Workout.date.desc())
        .all()
    )

    if not workouts:
        return 0

    workout_dates = sorted(set(w.date.date() for w in workouts), reverse=True)

    today = datetime.now().date()
    if workout_dates[0] < today - timedelta(days=7):
        return 0

    streak = 0
    current_week_start = today - timedelta(days=today.weekday())

    weeks_with_workouts = set()
    for d in workout_dates:
        week_start = d - timedelta(days=d.weekday())
        weeks_with_workouts.add(week_start)

    week = current_week_start
    while week in weeks_with_workouts:
        streak += 1
        week -= timedelta(days=7)

    return streak


def get_volume_over_time(db: Session, start_date: datetime = None, end_date: datetime = None) -> list[VolumeDataPoint]:
    query = (
        db.query(
            Workout.date,
            func.sum(Set.weight_lbs * Set.reps).label("volume")
        )
        .join(Set)
        .filter(Set.weight_lbs.isnot(None), Set.reps.isnot(None))
        .group_by(Workout.id)
        .order_by(Workout.date)
    )

    if start_date:
        query = query.filter(Workout.date >= start_date)
    if end_date:
        query = query.filter(Workout.date <= end_date)

    results = query.all()

    return [VolumeDataPoint(date=r.date, volume=round(r.volume, 2)) for r in results]


def get_exercise_progress(db: Session, exercise_id: int) -> list[ExerciseProgress]:
    results = (
        db.query(
            Workout.date,
            func.max(Set.weight_lbs).label("best_weight"),
            func.max(Set.weight_lbs * Set.reps).label("best_volume"),
            func.sum(Set.weight_lbs * Set.reps).label("total_volume"),
            func.avg(Set.rpe).label("avg_rpe"),
        )
        .join(Set)
        .filter(
            Set.exercise_id == exercise_id,
            Set.weight_lbs.isnot(None),
            Set.reps.isnot(None),
        )
        .group_by(Workout.id)
        .order_by(Workout.date)
        .all()
    )

    return [
        ExerciseProgress(
            date=r.date,
            best_weight=round(r.best_weight, 2),
            best_volume=round(r.best_volume, 2),
            total_volume=round(r.total_volume, 2),
            avg_rpe=round(r.avg_rpe, 1) if r.avg_rpe is not None else None,
        )
        for r in results
    ]


def get_exercise_prs(db: Session, exercise_id: int) -> ExercisePR:
    best_weight = (
        db.query(func.max(Set.weight_lbs))
        .filter(Set.exercise_id == exercise_id, Set.weight_lbs.isnot(None))
        .scalar()
        or 0
    )

    best_volume = (
        db.query(func.max(Set.weight_lbs * Set.reps))
        .filter(
            Set.exercise_id == exercise_id,
            Set.weight_lbs.isnot(None),
            Set.reps.isnot(None),
        )
        .scalar()
        or 0
    )

    best_reps = (
        db.query(func.max(Set.reps))
        .filter(Set.exercise_id == exercise_id, Set.reps.isnot(None))
        .scalar()
        or 0
    )

    best_set = (
        db.query(Set.weight_lbs, Set.reps)
        .filter(
            Set.exercise_id == exercise_id,
            Set.weight_lbs.isnot(None),
            Set.reps.isnot(None),
        )
        .order_by((Set.weight_lbs * (1 + Set.reps / 30)).desc())
        .first()
    )

    best_1rm = 0
    if best_set and best_set.weight_lbs and best_set.reps:
        best_1rm = best_set.weight_lbs * (1 + best_set.reps / 30)

    return ExercisePR(
        best_weight=round(best_weight, 2),
        best_volume=round(best_volume, 2),
        best_reps=round(best_reps, 2),
        best_estimated_1rm=round(best_1rm, 2),
    )


def get_all_exercise_prs(db: Session) -> list[ExercisePRSummary]:
    # Aggregate best weight, reps, and 1RM per exercise
    agg = (
        db.query(
            Exercise.id.label("exercise_id"),
            Exercise.name.label("exercise_name"),
            func.max(Set.weight_lbs).label("best_weight"),
            func.max(Set.reps).label("best_reps"),
        )
        .join(Set)
        .filter(Set.weight_lbs.isnot(None), Set.reps.isnot(None))
        .group_by(Exercise.id)
        .order_by(Exercise.name)
        .all()
    )

    results = []
    for r in agg:
        best_1rm = r.best_weight * (1 + r.best_reps / 30) if r.best_weight and r.best_reps else 0

        # Find the date when best weight was achieved
        best_set = (
            db.query(Workout.date)
            .join(Set)
            .filter(Set.exercise_id == r.exercise_id, Set.weight_lbs == r.best_weight)
            .order_by(Workout.date.asc())
            .first()
        )

        results.append(ExercisePRSummary(
            exercise_id=r.exercise_id,
            exercise_name=r.exercise_name,
            best_weight=round(r.best_weight, 2),
            best_reps=round(r.best_reps, 2),
            best_estimated_1rm=round(best_1rm, 2),
            best_weight_date=best_set.date if best_set else None,
        ))

    return results


def get_cardio_over_time(db: Session) -> list[CardioDataPoint]:
    results = (
        db.query(
            Workout.date,
            func.sum(Set.distance).label("distance_km"),
            func.sum(Set.seconds).label("seconds"),
        )
        .join(Set)
        .join(Exercise)
        .filter(
            Exercise.category == "cardio",
            Set.distance.isnot(None),
            Set.seconds.isnot(None),
        )
        .group_by(Workout.id)
        .order_by(Workout.date)
        .all()
    )

    return [
        CardioDataPoint(
            date=r.date,
            distance_km=round(r.distance_km, 2),
            seconds=round(r.seconds, 0),
        )
        for r in results
    ]


def get_volume_by_category(db: Session) -> list[CategoryVolume]:
    results = (
        db.query(
            Exercise.category,
            func.sum(Set.weight_lbs * Set.reps).label("volume"),
        )
        .join(Set)
        .filter(
            Set.weight_lbs.isnot(None),
            Set.reps.isnot(None),
            Exercise.category != "cardio",
        )
        .group_by(Exercise.category)
        .all()
    )

    return [
        CategoryVolume(category=r.category or "other", volume=round(r.volume, 2))
        for r in results
    ]
