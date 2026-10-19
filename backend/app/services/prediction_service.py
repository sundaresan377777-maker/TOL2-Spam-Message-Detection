"""
Prediction Service.
Executes end-to-end inference using the trained pipeline, parses class probabilities,
extracts key indicators, persists to the database, and creates informative explanations.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from app.utils.text_processing import clean_text, extract_key_indicators
from app.services.model_service import model_service
from app.database.repository import save_prediction


def generate_explanation(label: str, confidence: float, indicators: list[str]) -> str:
    conf_pct = round(confidence * 100, 1)
    if label == "SPAM":
        indicator_str = f" Contains suspicious indicators like: '{', '.join(indicators)}'." if indicators else ""
        return (
            f"Classified as SPAM with {conf_pct}% model confidence.{indicator_str} "
            f"The message exhibits lexical frequency patterns characteristic of unsolicited or promotional messages."
        )
    else:
        return (
            f"Classified as HAM (Legitimate) with {conf_pct}% model confidence. "
            f"The linguistic structure and vocabulary align closely with standard conversational or transactional messages."
        )


def process_prediction(db: Session, raw_message: str) -> Dict[str, Any]:
    # 1. Clean and normalize input
    cleaned = clean_text(raw_message)
    if not cleaned.strip():
        raise ValueError("Message contains no valid textual content to analyze.")

    # 2. Load model
    pipeline = model_service.load_pipeline()

    # 3. Model inference
    prediction_label = str(pipeline.predict([cleaned])[0]).upper()
    probabilities = pipeline.predict_proba([cleaned])[0]
    classes = [str(c).upper() for c in pipeline.classes_]

    prob_map = {cls: float(prob) for cls, prob in zip(classes, probabilities)}
    spam_prob = prob_map.get("SPAM", 0.0)
    ham_prob = prob_map.get("HAM", 0.0)
    confidence = prob_map.get(prediction_label, max(spam_prob, ham_prob))

    # 4. Extract indicators and explanation
    indicators = extract_key_indicators(raw_message)
    explanation = generate_explanation(prediction_label, confidence, indicators)

    # 5. Persist record to database
    record = save_prediction(
        db=db,
        message_text=raw_message,
        predicted_label=prediction_label,
        confidence=round(confidence, 4),
        spam_probability=round(spam_prob, 4),
        ham_probability=round(ham_prob, 4),
        indicators=indicators
    )

    # Sanitize message preview (first 100 characters)
    preview = raw_message[:100] + ("..." if len(raw_message) > 100 else "")

    return {
        "id": record.id,
        "prediction": prediction_label,
        "confidence": round(confidence, 4),
        "spam_probability": round(spam_prob, 4),
        "ham_probability": round(ham_prob, 4),
        "message_preview": preview,
        "character_count": len(raw_message),
        "detected_indicators": indicators,
        "explanation": explanation
    }
