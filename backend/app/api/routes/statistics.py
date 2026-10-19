"""
System Statistics Route.
Computes real database metrics and aggregations for dashboard analytics.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database import repository
from app.schemas.metrics import StatisticsResponse

router = APIRouter(prefix="/statistics", tags=["Statistics"])


@router.get("", response_model=StatisticsResponse)
def get_system_statistics(db: Session = Depends(get_db)):
    stats = repository.get_aggregate_statistics(db)
    return stats
