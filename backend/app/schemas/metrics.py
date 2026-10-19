"""
Pydantic Schemas for Model Evaluation Metrics and System Statistics.
"""

from typing import Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field


class ConfusionMatrixData(BaseModel):
    true_negative: int
    false_positive: int
    false_negative: int
    true_positive: int


class EvaluationMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    accuracy_percent: float
    precision_percent: float
    recall_percent: float
    f1_percent: float


class ModelMetricsResponse(BaseModel):
    model_type: str
    vectorizer: str
    smoothing_alpha: float
    dataset_name: str
    total_dataset_samples: int
    train_samples: int
    test_samples: int
    class_distribution: Dict[str, Any]
    evaluation_metrics: EvaluationMetrics
    confusion_matrix: ConfusionMatrixData
    training_timestamp: str
    random_seed: int


class ModelInfoResponse(BaseModel):
    model_name: str
    algorithm: str
    feature_extraction: str
    vocabulary_size: int
    dataset_source: str
    status: str
    is_trained: bool
    evaluation_summary: Dict[str, Any]


class DailyActivity(BaseModel):
    date: str
    total: int
    spam: int
    ham: int


class StatisticsResponse(BaseModel):
    total_analyzed: int
    spam_count: int
    ham_count: int
    spam_ratio: float
    ham_ratio: float
    avg_confidence: float
    recent_activity: List[DailyActivity]
    latest_prediction_time: str | None
