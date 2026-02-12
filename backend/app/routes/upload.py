from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import UploadResult
from ..services.csv_parser import parse_csv_data

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("", response_model=UploadResult)
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    csv_content = content.decode("utf-8")
    return parse_csv_data(csv_content, db)
