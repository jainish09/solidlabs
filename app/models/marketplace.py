"""SQLAlchemy model for Marketplace Listings."""

import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Float, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class MarketplaceListing(Base):
    """Database model for published or draft 3D design marketplace listings."""

    __tablename__ = "marketplace_listings"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    design_id: Mapped[str] = mapped_column(String(64), ForeignKey("cad_assets.id", ondelete="RESTRICT"), nullable=False, index=True)
    revision_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("design_revisions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    owner_id: Mapped[str] = mapped_column(String(64), default="usr_owner_default", index=True, nullable=False)

    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    description: Mapped[str] = mapped_column(String(4096), nullable=False)
    category: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    tags: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    license: Mapped[str] = mapped_column(String(64), default="CC-BY-4.0", nullable=False)

    indicative_price: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="USD", nullable=False)

    material_options: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    manufacturing_processes: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)

    # Listing classification: 'digital_design' (downloadable CAD) vs 'physical_part' (manufacturing service)
    listing_type: Mapped[str] = mapped_column(String(32), default="digital_design", nullable=False)

    # Lifecycle Status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SUSPENDED'
    status: Mapped[str] = mapped_column(String(32), default="DRAFT", index=True, nullable=False)

    # Explicit owner approval and legal rights confirmation
    ownership_confirmed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    takedown_status: Mapped[str] = mapped_column(String(32), default="active", index=True, nullable=False)

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
    )
    published_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    design: Mapped["CADAsset"] = relationship("CADAsset", back_populates="marketplace_listings")
    revision: Mapped[Optional["DesignRevision"]] = relationship("DesignRevision")
