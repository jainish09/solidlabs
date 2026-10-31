"""Application configuration settings using Pydantic Settings."""

import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """SolidLabs Backend Settings."""

    APP_NAME: str = "SolidLabs AI Manufacturing API"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS configuration
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    # Database
    DATABASE_URL: str = "sqlite:///./solidlabs.db"

    # CAD File Upload & Processing limits
    MAX_UPLOAD_SIZE_BYTES: int = 50 * 1024 * 1024  # 50 MB
    UPLOAD_TEMP_DIR: str = "./storage/temp_uploads"
    CAD_STORAGE_DIR: str = "./storage/cad_assets"
    EXPORTS_STORAGE_DIR: str = "./storage/exports"
    DEFAULT_STL_UNITS: str = "mm"

    # AI Provider Integration
    AI_PROVIDER: str = "none"  # "none", "openai", "gemini"
    AI_API_KEY: str = ""
    AI_MODEL_NAME: str = "gpt-4o-mini"
    AI_TIMEOUT_SECONDS: int = 10

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()

# Ensure storage directories exist
os.makedirs(settings.UPLOAD_TEMP_DIR, exist_ok=True)
os.makedirs(settings.CAD_STORAGE_DIR, exist_ok=True)
os.makedirs(settings.EXPORTS_STORAGE_DIR, exist_ok=True)

