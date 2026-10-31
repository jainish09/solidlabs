"""SQLAlchemy Model for CAD Quotation records."""

import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Integer, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class CADQuote(Base):
    """Database model for storing indicative manufacturing quotations."""

    __tablename__ = "quotes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    analysis_id: Mapped[str] = mapped_column(String(64), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False, index=True)

    process: Mapped[str] = mapped_column(String(64), nullable=False)
    material: Mapped[str] = mapped_column(String(64), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    finish: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    total_price: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="USD", nullable=False)
    lead_time_business_days: Mapped[int] = mapped_column(Integer, nullable=False)
    estimate_status: Mapped[str] = mapped_column(String(32), default="indicative", nullable=False)

    # Detailed line items and costing breakdown
    line_items: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    pricing_assumptions: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False
    )

    # Relationships
    analysis: Mapped["CADAnalysis"] = relationship("CADAnalysis", back_populates="quotes")
    orders: Mapped[List["CADOrder"]] = relationship("CADOrder", back_populates="quote", cascade="all, delete-orphan")
