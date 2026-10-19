"""
Evaluation and Inference Utility Script.
Loads the trained pipeline to perform test evaluations and spot checks.
"""

import os
import sys
import json
import joblib

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.utils.text_processing import clean_text

MODEL_PATH = os.path.join(BACKEND_DIR, "artifacts", "spam_classifier_pipeline.joblib")
METRICS_PATH = os.path.join(BACKEND_DIR, "artifacts", "model_metrics.json")


def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Run python ml/train.py first.")
    return joblib.load(MODEL_PATH)


def predict_message(text: str):
    pipeline = load_model()
    cleaned = clean_text(text)
    pred = pipeline.predict([cleaned])[0]
    probs = pipeline.predict_proba([cleaned])[0]
    classes = list(pipeline.classes_)
    prob_dict = {cls: float(prob) for cls, prob in zip(classes, probs)}
    confidence = prob_dict[pred]

    return {
        "text": text,
        "cleaned_text": cleaned,
        "prediction": pred,
        "confidence": confidence,
        "probabilities": prob_dict
    }


if __name__ == "__main__":
    test_cases = [
        "Congratulations! You have won a free prize. Click here to claim your reward!",
        "Hi, are we meeting tomorrow at 10 AM?",
        "URGENT: Your account has been suspended. Call 1-800-555-0199 immediately.",
        "Hey, can you grab dinner on the way home?",
    ]
    print("Testing Model Inference on Sample Messages:")
    for msg in test_cases:
        res = predict_message(msg)
        print(f"[{res['prediction']}] (Confidence: {res['confidence']:.2%}) => {msg}")
