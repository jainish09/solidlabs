"""SQLAlchemy model for AI-assisted Design Improvement Requests."""

import datetime
from typing import Optional, Dict, Any
from sqlalchemy import String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class ImprovementRequest(Base):
    """Database model for AI-assisted CAD improvement proposals and execution."""

    __tablename__ = "improvement_requests"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    design_id: Mapped[str] = mapped_column(String(64), ForeignKey("cad_assets.id", ondelete="CASCADE"), nullable=False, index=True)
    owner_id: Mapped[str] = mapped_column(String(64), default="usr_owner_default", index=True, nullable=False)

    user_requirements: Mapped[str] = mapped_column(String(2048), nullable=False)
    intended_application: Mapped[str] = mapped_column(String(512), nullable=False)
    manufacturing_process: Mapped[str] = mapped_column(String(64), nullable=False)
    material: Mapped[str] = mapped_column(String(64), nullable=False)
    constraints: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    # Structured revision plan: observations, assumptions, proposed_modifications, feasibility
    ai_revision_plan: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    executed_revision_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("design_revisions.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Status: 'PLANNED' | 'REVISED' | 'REJECTED'
    status: Mapped[str] = mapped_column(String(32), default="PLANNED", index=True, nullable=False)

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False
    )

    # Relationships
    design: Mapped["CADAsset"] = relationship("CADAsset", back_populates="improvement_requests")
    executed_revision: Mapped[Optional["DesignRevision"]] = relationship("DesignRevision")
