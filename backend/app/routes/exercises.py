from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Exercise
from ..schemas import Exercise as ExerciseSchema, ExerciseProgress, ExercisePR
from ..services.analytics import get_exercise_progress, get_exercise_prs

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.get("", response_model=list[ExerciseSchema])
def list_exercises(db: Session = Depends(get_db)):
    exercises = db.query(Exercise).order_by(Exercise.name).all()
    return exercises


@router.get("/{exercise_id}/progress", response_model=list[ExerciseProgress])
def exercise_progress(exercise_id: int, db: Session = Depends(get_db)):
    return get_exercise_progress(db, exercise_id)


@router.get("/{exercise_id}/prs", response_model=ExercisePR)
def exercise_prs(exercise_id: int, db: Session = Depends(get_db)):
    return get_exercise_prs(db, exercise_id)
