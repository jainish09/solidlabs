"""Health check and diagnostic API route."""

import datetime
import time
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.db.session import get_db
from app.schemas.health import HealthResponse

router = APIRouter()
START_TIME = time.time()


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Service Health Check",
    description="Returns API service health, uptime, environment, and verifies database connectivity.",
)
def get_health(db: Session = Depends(get_db)) -> HealthResponse:
    uptime = time.time() - START_TIME

    # Verify database connection
    db_connected = False
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        db_connected = False

    return HealthResponse(
        status="healthy" if db_connected else "degraded",
        version=settings.APP_VERSION,
        uptime_seconds=round(uptime, 2),
        database_connected=db_connected,
        environment=settings.APP_ENV,
        timestamp=datetime.datetime.now(datetime.timezone.utc),
    )
