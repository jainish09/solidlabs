"""Schemas for Manufacturing Orders and Status Lifecycle."""

import datetime
from enum import Enum
from typing import Optional, List, Dict, Any, Annotated
from pydantic import BaseModel, Field, StringConstraints

# Safe EmailStr import with zero-crash fallback if email-validator package is missing in global python
try:
    import email_validator  # noqa: F401
    from pydantic import EmailStr
except (ImportError, Exception):
    EmailStr = Annotated[
        str,
        StringConstraints(
            strip_whitespace=True,
            to_lower=True,
            pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",
        ),
    ]

from app.schemas.quote import CADQuoteResponse


class OrderStatus(str, Enum):
    """Manufacturing Order lifecycle states."""

    REQUESTED = "REQUESTED"
    APPROVED = "APPROVED"
    IN_PRODUCTION = "IN_PRODUCTION"
    QUALITY_CHECK = "QUALITY_CHECK"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"


# Valid state transitions lookup table
VALID_TRANSITIONS: Dict[OrderStatus, List[OrderStatus]] = {
    OrderStatus.REQUESTED: [OrderStatus.APPROVED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
    OrderStatus.APPROVED: [OrderStatus.IN_PRODUCTION, OrderStatus.CANCELLED],
    OrderStatus.IN_PRODUCTION: [OrderStatus.QUALITY_CHECK, OrderStatus.CANCELLED],
    OrderStatus.QUALITY_CHECK: [OrderStatus.DELIVERED, OrderStatus.IN_PRODUCTION, OrderStatus.CANCELLED],
    OrderStatus.DELIVERED: [],   # Terminal state
    OrderStatus.CANCELLED: [],   # Terminal state
    OrderStatus.REJECTED: [],    # Terminal state
}


class StatusHistoryEntry(BaseModel):
    """Historical audit log entry for order status transition."""

    from_status: Optional[str] = Field(None, description="Previous status")
    to_status: str = Field(..., description="Target status")
    timestamp: str = Field(..., description="ISO timestamp of change")
    notes: Optional[str] = Field(None, description="Operator or customer notes")


class OrderCreateRequest(BaseModel):
    """Payload to convert an indicative quote into a manufacturing order."""

    quote_id: str = Field(..., description="ID of valid indicative quote")
    customer_name: str = Field(..., min_length=2, max_length=128, description="Customer or organization contact name")
    customer_email: EmailStr = Field(..., description="Customer contact email address")
    shipping_address: str = Field(..., min_length=5, max_length=512, description="Physical delivery destination")
    notes: Optional[str] = Field(None, max_length=1024, description="Optional engineering or delivery notes")


class OrderStatusUpdateRequest(BaseModel):
    """Payload for updating order status through the manufacturing lifecycle."""

    new_status: OrderStatus = Field(..., description="Target lifecycle state")
    notes: Optional[str] = Field(None, max_length=1024, description="Reason or context for status transition")


class CADOrderResponse(BaseModel):
    """Response payload for order details."""

    order_id: str = Field(..., description="Unique order identifier")
    quote_id: str = Field(..., description="Associated quote ID")
    customer_name: str = Field(..., description="Customer name")
    customer_email: str = Field(..., description="Customer email")
    shipping_address: str = Field(..., description="Delivery address")
    notes: Optional[str] = Field(None, description="Order notes")
    status: OrderStatus = Field(..., description="Current manufacturing lifecycle status")
    total_price: float = Field(..., description="Total order price in currency")
    currency: str = Field(default="USD", description="Currency code")
    status_history: List[StatusHistoryEntry] = Field(default_factory=list, description="Audit log of status changes")
    created_at: datetime.datetime = Field(..., description="Order placement timestamp")
    updated_at: datetime.datetime = Field(..., description="Last modification timestamp")
    quote: Optional[CADQuoteResponse] = Field(None, description="Associated quote details if requested")


class OrderListResponse(BaseModel):
    """Paginated order list response."""

    items: List[CADOrderResponse] = Field(..., description="List of order records")
    total: int = Field(..., description="Total count matching filter criteria")
    skip: int = Field(..., description="Pagination offset applied")
    limit: int = Field(..., description="Page limit applied")
