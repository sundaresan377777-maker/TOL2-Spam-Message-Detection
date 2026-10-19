"""
SQLAlchemy Database Models for Spam Detection System.
"""

import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Index
from app.database.connection import Base


class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    message_text = Column(Text, nullable=False)
    predicted_label = Column(String(10), nullable=False, index=True)  # "SPAM" or "HAM"
    confidence = Column(Float, nullable=False)
    spam_probability = Column(Float, nullable=False)
    ham_probability = Column(Float, nullable=False)
    indicators = Column(String(500), nullable=True)  # Comma-separated detected spam keywords
    character_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    __table_args__ = (
        Index("idx_label_created_at", "predicted_label", "created_at"),
    )
