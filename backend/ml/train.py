"""
Spam Message Detection - Model Training Pipeline
Trains a Multinomial Naive Bayes classifier with TF-IDF vectorization
using stratified splitting and held-out test set evaluation.
"""

import os
import sys
import json
import datetime
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# Ensure backend directory is in python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.utils.text_processing import clean_text
from ml.dataset import get_cleaned_dataset

ARTIFACTS_DIR = os.path.join(BACKEND_DIR, "artifacts")
MODEL_PATH = os.path.join(ARTIFACTS_DIR, "spam_classifier_pipeline.joblib")
METRICS_PATH = os.path.join(ARTIFACTS_DIR, "model_metrics.json")


def train_and_evaluate():
    print("=" * 60)
    print("STARTING SPAM CLASSIFIER MODEL TRAINING")
    print("=" * 60)

    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

    # 1. Load dataset
    print("[1/5] Loading and validating dataset...")
    X_raw, y = get_cleaned_dataset()
    total_samples = len(X_raw)
    spam_count = int((y == "SPAM").sum())
    ham_count = int((y == "HAM").sum())
    print(f"Total valid samples: {total_samples}")
    print(f"Class breakdown: HAM={ham_count} ({ham_count/total_samples:.1%}), SPAM={spam_count} ({spam_count/total_samples:.1%})")

    # 2. Text preprocessing
    print("[2/5] Preprocessing text corpus...")
    X_cleaned = X_raw.apply(clean_text)

    # 3. Stratified train/test split (80% train, 20% test)
    print("[3/5] Performing stratified train/test split (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X_cleaned,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )
    print(f"Training samples: {len(X_train)} | Test samples: {len(X_test)}")

    # 4. Construct Scikit-learn Pipeline
    print("[4/5] Building and fitting TF-IDF + Multinomial Naive Bayes pipeline...")
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=5000,
            sublinear_tf=True
        )),
        ("classifier", MultinomialNB(alpha=0.1))
    ])

    pipeline.fit(X_train, y_train)
    print("Model training completed successfully.")

    # 5. Evaluate on Held-out Test Set
    print("[5/5] Evaluating on held-out test set...")
    y_pred = pipeline.predict(X_test)
    y_pred_proba = pipeline.predict_proba(X_test)

    # Target class for binary metrics is 'SPAM'
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, pos_label="SPAM", zero_division=0))
    rec = float(recall_score(y_test, y_pred, pos_label="SPAM", zero_division=0))
    f1 = float(f1_score(y_test, y_pred, pos_label="SPAM", zero_division=0))

    # Confusion Matrix: labels=['HAM', 'SPAM']
    cm = confusion_matrix(y_test, y_pred, labels=["HAM", "SPAM"])
    tn, fp, fn, tp = int(cm[0, 0]), int(cm[0, 1]), int(cm[1, 0]), int(cm[1, 1])

    print("-" * 60)
    print("EVALUATION RESULTS (HELD-OUT TEST SET):")
    print(f"Accuracy:  {acc:.4f} ({acc*100:.2f}%)")
    print(f"Precision: {prec:.4f} ({prec*100:.2f}%)")
    print(f"Recall:    {rec:.4f} ({rec*100:.2f}%)")
    print(f"F1-Score:  {f1:.4f} ({f1*100:.2f}%)")
    print("\nConfusion Matrix:")
    print(f"  True Negative  (HAM as HAM):   {tn}")
    print(f"  False Positive (HAM as SPAM):  {fp}")
    print(f"  False Negative (SPAM as HAM):  {fn}")
    print(f"  True Positive  (SPAM as SPAM): {tp}")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred))

    # Persist model pipeline
    print(f"Saving trained pipeline to {MODEL_PATH}...")
    joblib.dump(pipeline, MODEL_PATH)

    # Save evaluation metrics and model metadata
    metrics_data = {
        "model_type": "Multinomial Naive Bayes",
        "vectorizer": "TF-IDF (unigrams & bigrams, max_features=5000, sublinear_tf=True)",
        "smoothing_alpha": 0.1,
        "dataset_name": "SMS Spam Collection Dataset",
        "total_dataset_samples": total_samples,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "class_distribution": {
            "ham_count": ham_count,
            "spam_count": spam_count,
            "ham_percentage": round(ham_count / total_samples * 100, 2),
            "spam_percentage": round(spam_count / total_samples * 100, 2)
        },
        "evaluation_metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "accuracy_percent": round(acc * 100, 2),
            "precision_percent": round(prec * 100, 2),
            "recall_percent": round(rec * 100, 2),
            "f1_percent": round(f1 * 100, 2)
        },
        "confusion_matrix": {
            "true_negative": tn,
            "false_positive": fp,
            "false_negative": fn,
            "true_positive": tp
        },
        "training_timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "random_seed": 42
    }

    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)

    print(f"Saved metrics metadata to {METRICS_PATH}")
    print("=" * 60)
    print("MODEL TRAINING AND ARTIFACT GENERATION COMPLETED SUCCESSFULLY")
    print("=" * 60)
    return metrics_data


if __name__ == "__main__":
    train_and_evaluate()
