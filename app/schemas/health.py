"""Schemas for API Health and Diagnostic endpoints."""

import datetime
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health status response model."""

    status: str = Field(default="healthy", description="Application operational status")
    version: str = Field(description="SolidLabs backend service version")
    uptime_seconds: float = Field(description="Service uptime in seconds")
    database_connected: bool = Field(description="Database connectivity check status")
    environment: str = Field(description="Active environment deployment name")
    timestamp: datetime.datetime = Field(description="Current UTC timestamp")
