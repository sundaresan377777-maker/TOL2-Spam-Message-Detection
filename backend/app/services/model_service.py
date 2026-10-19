"""
Model Service Singleton.
Manages lazy loading and caching of the trained ML pipeline and metrics artifact.
"""

import os
import json
import joblib
from typing import Optional, Dict, Any
from app.core.config import settings

MODEL_FILE = os.path.join(settings.ARTIFACTS_DIR, "spam_classifier_pipeline.joblib")
METRICS_FILE = os.path.join(settings.ARTIFACTS_DIR, "model_metrics.json")


class ModelService:
    _instance = None
    _pipeline = None
    _metrics: Optional[Dict[str, Any]] = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = ModelService()
        return cls._instance

    def is_model_available(self) -> bool:
        return os.path.exists(MODEL_FILE)

    def load_pipeline(self):
        if self._pipeline is None:
            if not os.path.exists(MODEL_FILE):
                raise RuntimeError(
                    f"Model artifact not found at {MODEL_FILE}. "
                    "Run 'python backend/ml/train.py' to train and save the model artifact."
                )
            self._pipeline = joblib.load(MODEL_FILE)
        return self._pipeline

    def load_metrics(self) -> Dict[str, Any]:
        if self._metrics is None:
            if not os.path.exists(METRICS_FILE):
                return {
                    "model_type": "Multinomial Naive Bayes",
                    "status": "unavailable",
                    "message": "Model evaluation metadata not found. Run training script."
                }
            with open(METRICS_FILE, "r", encoding="utf-8") as f:
                self._metrics = json.load(f)
        return self._metrics

    def get_model_info(self) -> Dict[str, Any]:
        pipeline = self.load_pipeline()
        metrics = self.load_metrics()
        
        vectorizer = pipeline.named_steps.get("tfidf")
        vocab_size = len(vectorizer.vocabulary_) if vectorizer and hasattr(vectorizer, "vocabulary_") else 0

        return {
            "model_name": "SMS Spam Classifier (MultinomialNB + TF-IDF)",
            "algorithm": "Multinomial Naive Bayes",
            "feature_extraction": "TF-IDF (Term Frequency - Inverse Document Frequency)",
            "vocabulary_size": vocab_size,
            "dataset_source": metrics.get("dataset_name", "SMS Spam Collection Dataset"),
            "status": "active",
            "is_trained": True,
            "evaluation_summary": metrics.get("evaluation_metrics", {})
        }


model_service = ModelService.get_instance()
