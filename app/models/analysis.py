"""SQLAlchemy Model for CAD Analysis records."""

import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Integer, Float, Boolean, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class CADAnalysis(Base):
    """Database model for storing CAD geometry analysis and DFM results."""

    __tablename__ = "analyses"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    units: Mapped[str] = mapped_column(String(16), default="mm", nullable=False)

    # Geometry measurements (in configured units, default mm)
    dimension_x: Mapped[float] = mapped_column(Float, nullable=False)
    dimension_y: Mapped[float] = mapped_column(Float, nullable=False)
    dimension_z: Mapped[float] = mapped_column(Float, nullable=False)
    surface_area_mm2: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    volume_mm3: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_watertight: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_volume_valid: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    triangle_count: Mapped[int] = mapped_column(Integer, nullable=False)

    # Structured DFM findings & Warnings stored as JSON
    warnings: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    dfm_findings: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)

    # AI Explanation if requested
    ai_explanation: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False
    )

    # Relationships
    quotes: Mapped[List["CADQuote"]] = relationship("CADQuote", back_populates="analysis", cascade="all, delete-orphan")
