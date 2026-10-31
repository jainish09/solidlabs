"""SQLAlchemy models for CAD Assets and Design Revisions."""

import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class CADAsset(Base):
    """Database model for registered CAD files and design assets."""

    __tablename__ = "cad_assets"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    owner_id: Mapped[str] = mapped_column(String(64), default="usr_owner_default", index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)

    # Source origin: 'upload' | 'generated' | 'revised'
    source_type: Mapped[str] = mapped_column(String(32), default="upload", nullable=False)

    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_format: Mapped[str] = mapped_column(String(16), default="stl", nullable=False)
    file_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)

    analysis_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("analyses.id", ondelete="SET NULL"), nullable=True, index=True
    )

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
    )

    # Relationships
    analysis: Mapped[Optional["CADAnalysis"]] = relationship("CADAnalysis")
    revisions: Mapped[List["DesignRevision"]] = relationship(
        "DesignRevision", back_populates="design", cascade="all, delete-orphan", order_by="DesignRevision.revision_number"
    )
    improvement_requests: Mapped[List["ImprovementRequest"]] = relationship(
        "ImprovementRequest", back_populates="design", cascade="all, delete-orphan"
    )
    marketplace_listings: Mapped[List["MarketplaceListing"]] = relationship(
        "MarketplaceListing", back_populates="design", cascade="all, delete-orphan"
    )


class DesignRevision(Base):
    """Database model tracking immutable geometric revisions and operation history."""

    __tablename__ = "design_revisions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    design_id: Mapped[str] = mapped_column(String(64), ForeignKey("cad_assets.id", ondelete="CASCADE"), nullable=False, index=True)
    revision_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_format: Mapped[str] = mapped_column(String(16), default="stl", nullable=False)
    file_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)

    change_summary: Mapped[str] = mapped_column(String(512), nullable=False)
    operation_history: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    geometry_snapshot: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False
    )

    # Relationships
    design: Mapped["CADAsset"] = relationship("CADAsset", back_populates="revisions")
