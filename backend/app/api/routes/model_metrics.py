"""
Model Metrics and Info Routes.
Exposes actual held-out test evaluation results and model configuration.
"""

from fastapi import APIRouter, HTTPException, status
from app.services.model_service import model_service
from app.schemas.metrics import ModelMetricsResponse, ModelInfoResponse

router = APIRouter(prefix="/model", tags=["Model"])


@router.get("/metrics", response_model=ModelMetricsResponse)
def get_model_metrics():
    metrics = model_service.load_metrics()
    if metrics.get("status") == "unavailable":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model metrics not available. Model evaluation has not yet been executed."
        )
    return metrics


@router.get("/info", response_model=ModelInfoResponse)
def get_model_info():
    if not model_service.is_model_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model pipeline has not been trained yet."
        )
    return model_service.get_model_info()
