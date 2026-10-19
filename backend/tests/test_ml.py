"""
Automated Machine Learning Pipeline Tests.
Validates dataset integrity, text preprocessing, pipeline persistence, and prediction probabilities.
"""

import os
import sys
import pytest
import joblib

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.utils.text_processing import clean_text, extract_key_indicators
from ml.dataset import get_cleaned_dataset

MODEL_PATH = os.path.join(BACKEND_DIR, "artifacts", "spam_classifier_pipeline.joblib")


def test_text_cleaning():
    raw = "Click here: https://free-gift.com to win $500 cash now!!! Call 1-800-555-0199."
    cleaned = clean_text(raw)
    assert "https://" not in cleaned
    assert "url_link" in cleaned
    assert "currency_amount" in cleaned
    assert "phone_num" in cleaned


def test_indicator_extraction():
    msg = "Urgent! You have won a free prize. Claim your lottery jackpot now."
    indicators = extract_key_indicators(msg)
    assert "free" in indicators
    assert "prize" in indicators
    assert "claim" in indicators or "jackpot" in indicators


def test_dataset_integrity():
    X, y = get_cleaned_dataset()
    assert len(X) > 500
    assert len(X) == len(y)
    unique_labels = set(y.unique())
    assert unique_labels == {"HAM", "SPAM"}
    assert (y == "HAM").sum() > 0
    assert (y == "SPAM").sum() > 0


def test_trained_pipeline_inference():
    assert os.path.exists(MODEL_PATH), "Model artifact does not exist."
    pipeline = joblib.load(MODEL_PATH)

    # Validate predict
    spam_sample = "Free entry in a competition to win $10,000 cash. Text WIN to 88088 now."
    pred = pipeline.predict([clean_text(spam_sample)])[0]
    assert pred == "SPAM"

    ham_sample = "Are we having our lunch sync at the cafeteria today?"
    pred_ham = pipeline.predict([clean_text(ham_sample)])[0]
    assert pred_ham == "HAM"

    # Validate predict_proba
    probs = pipeline.predict_proba([clean_text(spam_sample)])[0]
    assert len(probs) == 2
    assert 0.0 <= probs[0] <= 1.0
    assert 0.0 <= probs[1] <= 1.0
    assert round(sum(probs), 4) == 1.0
