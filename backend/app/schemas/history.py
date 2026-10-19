"""
Pydantic Schemas for Analysis History.
"""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class HistoryItem(BaseModel):
    id: int
    message_preview: str
    predicted_label: str
    confidence: float
    spam_probability: float
    ham_probability: float
    character_count: int
    indicators: List[str] = Field(default_factory=list)
    created_at: datetime


class HistoryListResponse(BaseModel):
    items: List[HistoryItem]
    total_count: int
    page: int
    page_size: int
    total_pages: int


class HistoryDetailResponse(BaseModel):
    id: int
    message_text: str
    predicted_label: str
    confidence: float
    spam_probability: float
    ham_probability: float
    character_count: int
    indicators: List[str]
    created_at: datetime


class DeleteResponse(BaseModel):
    success: bool
    message: str
    deleted_id: Optional[int] = None
    deleted_count: Optional[int] = None
