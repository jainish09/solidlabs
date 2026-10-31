"""SQLAlchemy model for Text-to-Parametric CAD Generation Jobs."""

import datetime
from typing import Optional, Dict, Any
from sqlalchemy import String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class DesignGenerationJob(Base):
    """Database model tracking parametric CAD generation requests and outcomes."""

    __tablename__ = "design_generation_jobs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    owner_id: Mapped[str] = mapped_column(String(64), default="usr_owner_default", index=True, nullable=False)
    prompt: Mapped[str] = mapped_column(String(2048), nullable=False)
    template_type: Mapped[str] = mapped_column(String(64), nullable=False)
    parameters: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    # Status: 'PENDING' | 'COMPLETED' | 'FAILED'
    status: Mapped[str] = mapped_column(String(32), default="PENDING", index=True, nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)

    resulting_design_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("cad_assets.id", ondelete="SET NULL"), nullable=True, index=True
    )

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False
    )

    # Relationships
    resulting_design: Mapped[Optional["CADAsset"]] = relationship("CADAsset")
