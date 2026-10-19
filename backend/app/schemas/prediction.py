"""
Pydantic Schemas for Prediction Request and Response.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="The raw SMS message text to analyze"
    )


class PredictResponse(BaseModel):
    id: Optional[int] = Field(None, description="Persisted record ID in database")
    prediction: str = Field(..., description="Classification category: 'SPAM' or 'HAM'")
    confidence: float = Field(..., description="Estimated model probability for the predicted class [0.0 - 1.0]")
    spam_probability: float = Field(..., description="Probability message is spam [0.0 - 1.0]")
    ham_probability: float = Field(..., description="Probability message is ham [0.0 - 1.0]")
    message_preview: str = Field(..., description="Sanitized preview of original message")
    character_count: int = Field(..., description="Total characters in input message")
    detected_indicators: List[str] = Field(default_factory=list, description="Notable keywords or patterns identified")
    explanation: str = Field(..., description="User-friendly explanation of why this verdict was reached")
