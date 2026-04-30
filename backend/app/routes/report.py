from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from ..database import get_db
from ..schemas import ReportData
from ..services.analytics import get_report_data

router = APIRouter(prefix="/report", tags=["report"])


@router.get("", response_model=ReportData)
def get_report(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    dt_to = datetime.fromisoformat(date_to) if date_to else datetime.now()
    dt_from = datetime.fromisoformat(date_from) if date_from else dt_to - timedelta(days=90)
    return get_report_data(db, dt_from, dt_to)
