"""SQLAlchemy Model for Manufacturing Orders."""

import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Integer, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class CADOrder(Base):
    """Database model for tracking customer manufacturing orders through the lifecycle."""

    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    quote_id: Mapped[str] = mapped_column(String(64), ForeignKey("quotes.id", ondelete="RESTRICT"), nullable=False, index=True)

    customer_name: Mapped[str] = mapped_column(String(128), nullable=False)
    customer_email: Mapped[str] = mapped_column(String(128), nullable=False)
    shipping_address: Mapped[str] = mapped_column(String(512), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)

    # Valid statuses: REQUESTED, APPROVED, IN_PRODUCTION, QUALITY_CHECK, DELIVERED, CANCELLED, REJECTED
    status: Mapped[str] = mapped_column(String(32), default="REQUESTED", nullable=False, index=True)

    total_price: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="USD", nullable=False)

    status_history: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)

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
    quote: Mapped["CADQuote"] = relationship("CADQuote", back_populates="orders")
