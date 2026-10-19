"""
Application Configuration and Settings.
Loads settings from environment variables with sensible production and local defaults.
"""

import os
from pydantic import BaseModel


class Settings(BaseModel):
    PROJECT_NAME: str = "Spam Message Detection System"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./spam_detector.db")    
# CORS Origins (comma-separated string or '*' in development)
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    ARTIFACTS_DIR: str = os.getenv("ARTIFACTS_DIR", os.path.join(BASE_DIR, "artifacts"))
    
    # ML Constraints
    MAX_MESSAGE_LENGTH: int = 5000
    
    @property
    def cors_origins_list(self) -> list[str]:
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
