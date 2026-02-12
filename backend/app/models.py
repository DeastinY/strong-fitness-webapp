from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False)
    name = Column(String, nullable=False)
    duration_minutes = Column(Integer)

    sets = relationship("Set", back_populates="workout", cascade="all, delete-orphan")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    category = Column(String)

    sets = relationship("Set", back_populates="exercise")


class Set(Base):
    __tablename__ = "sets"

    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    set_order = Column(String)
    weight_lbs = Column(Float)
    reps = Column(Float)
    distance = Column(Float)
    seconds = Column(Float)
    rpe = Column(Integer)

    workout = relationship("Workout", back_populates="sets")
    exercise = relationship("Exercise", back_populates="sets")

    @property
    def volume(self):
        if self.weight_lbs and self.reps:
            return self.weight_lbs * self.reps
        return 0
