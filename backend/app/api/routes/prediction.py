"""
Prediction Route.
Accepts SMS text messages, executes ML classification, and returns category with confidence.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.prediction import PredictRequest, PredictResponse
from app.services.prediction_service import process_prediction
from app.services.model_service import model_service
from app.core.config import settings

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post("", response_model=PredictResponse, status_code=status.HTTP_200_OK)
def predict_sms(payload: PredictRequest, db: Session = Depends(get_db)):
    # Validate message content
    raw_text = payload.message.strip()
    if not raw_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Message cannot be empty or contain only whitespace."
        )

    if len(raw_text) > settings.MAX_MESSAGE_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Message exceeds maximum allowed length of {settings.MAX_MESSAGE_LENGTH} characters."
        )

    if not model_service.is_model_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Trained model artifact is not available. Please train the model first."
        )

    try:
        result = process_prediction(db=db, raw_message=raw_text)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while evaluating the message."
        )
