from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os

from .database import engine, get_db, Base
from .models import Workout, Exercise, Set
from .routes import workouts, exercises, upload, report
from .services.analytics import (
    calculate_kpi_stats,
    get_volume_over_time,
    get_volume_by_category,
    get_cardio_over_time,
    get_all_exercise_prs,
)
from .services.csv_parser import parse_csv_data
from .schemas import KPIStats, VolumeDataPoint, CategoryVolume, CardioDataPoint, ExercisePRSummary

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fitness Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workouts.router)
app.include_router(exercises.router)
app.include_router(upload.router)
app.include_router(report.router)


@app.on_event("startup")
def seed_database():
    from .database import SessionLocal

    db = SessionLocal()
    try:
        workout_count = db.query(Workout).count()
        if workout_count == 0:
            seed_path = os.getenv("SEED_CSV_PATH", "/app/seed/data.csv")
            if os.path.exists(seed_path):
                with open(seed_path, "r") as f:
                    csv_content = f.read()
                result = parse_csv_data(csv_content, db)
                print(f"Seeded database: {result.workouts_created} workouts, {result.sets_created} sets")
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Fitness Tracker API", "version": "1.0.0"}


@app.get("/stats/kpi", response_model=KPIStats)
def get_kpi_stats(db: Session = Depends(get_db)):
    return calculate_kpi_stats(db)


@app.get("/stats/volume", response_model=list[VolumeDataPoint])
def get_volume_stats(db: Session = Depends(get_db)):
    return get_volume_over_time(db)


@app.get("/stats/categories", response_model=list[CategoryVolume])
def get_category_stats(db: Session = Depends(get_db)):
    return get_volume_by_category(db)


@app.get("/stats/cardio", response_model=list[CardioDataPoint])
def get_cardio_stats(db: Session = Depends(get_db)):
    return get_cardio_over_time(db)


@app.get("/stats/prs", response_model=list[ExercisePRSummary])
def get_prs(db: Session = Depends(get_db)):
    return get_all_exercise_prs(db)
