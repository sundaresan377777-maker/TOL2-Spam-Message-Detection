"""
Pydantic Schemas for System Health.
"""

from typing import Dict, Any
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    version: str
    model_loaded: bool
    database_connected: bool
    timestamp: str
    system_details: Dict[str, Any]
