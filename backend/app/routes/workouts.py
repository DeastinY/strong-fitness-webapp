from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import datetime
from typing import Optional
from ..database import get_db
from ..models import Workout, Set
from ..schemas import WorkoutWithSets, WorkoutSummary

router = APIRouter(prefix="/workouts", tags=["workouts"])


@router.get("", response_model=list[WorkoutSummary])
def list_workouts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            Workout,
            func.sum(Set.weight_lbs * Set.reps).label("total_volume"),
            func.count(func.distinct(Set.exercise_id)).label("exercise_count"),
            func.count(Set.id).label("set_count"),
        )
        .outerjoin(Set)
        .group_by(Workout.id)
        .order_by(Workout.date.desc())
    )

    if start_date:
        query = query.filter(Workout.date >= start_date)
    if end_date:
        query = query.filter(Workout.date <= end_date)

    results = query.offset(skip).limit(limit).all()

    return [
        WorkoutSummary(
            id=r.Workout.id,
            date=r.Workout.date,
            name=r.Workout.name,
            duration_minutes=r.Workout.duration_minutes,
            total_volume=round(r.total_volume or 0, 2),
            exercise_count=r.exercise_count or 0,
            set_count=r.set_count or 0,
        )
        for r in results
    ]


@router.get("/{workout_id}", response_model=WorkoutWithSets)
def get_workout(workout_id: int, db: Session = Depends(get_db)):
    workout = (
        db.query(Workout)
        .options(joinedload(Workout.sets).joinedload(Set.exercise))
        .filter(Workout.id == workout_id)
        .first()
    )

    if not workout:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Workout not found")

    sets_with_volume = []
    for s in workout.sets:
        sets_with_volume.append({
            "id": s.id,
            "workout_id": s.workout_id,
            "exercise_id": s.exercise_id,
            "set_order": s.set_order,
            "weight_lbs": s.weight_lbs,
            "reps": s.reps,
            "distance": s.distance,
            "seconds": s.seconds,
            "rpe": s.rpe,
            "volume": s.volume,
            "exercise": {
                "id": s.exercise.id,
                "name": s.exercise.name,
                "category": s.exercise.category,
            },
        })

    return WorkoutWithSets(
        id=workout.id,
        date=workout.date,
        name=workout.name,
        duration_minutes=workout.duration_minutes,
        sets=sets_with_volume,
    )
