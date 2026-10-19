"""
Health Check Route.
Reports status of API server, ML model pipeline, and database connection.
"""

from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.connection import get_db
from app.services.model_service import model_service
from app.schemas.health import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse)
def check_health(db: Session = Depends(get_db)):
    # Check model
    model_loaded = model_service.is_model_available()

    # Check database
    db_connected = False
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        db_connected = False

    status = "healthy" if (model_loaded and db_connected) else "degraded"

    return {
        "status": status,
        "version": "1.0.0",
        "model_loaded": model_loaded,
        "database_connected": db_connected,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "system_details": {
            "model_architecture": "Multinomial Naive Bayes + TF-IDF",
            "classifier_type": "Binary (SPAM/HAM)"
        }
    }
