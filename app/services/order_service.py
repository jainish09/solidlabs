"""Order Management Service for SolidLabs Manufacturing Workflows.

Maintains strict lifecycle state machines, audit logs, and linkage to CAD quotes and analyses.
"""

import datetime
import uuid
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.quote import CADQuote
from app.models.order import CADOrder
from app.schemas.order import (
    OrderCreateRequest,
    OrderStatus,
    OrderStatusUpdateRequest,
    VALID_TRANSITIONS,
)


class OrderError(Exception):
    """Domain error for order management business logic."""
    pass


class OrderNotFoundError(OrderError):
    """Raised when an order ID is not found in database."""
    pass


class InvalidStateTransitionError(OrderError):
    """Raised when an illegal lifecycle state transition is attempted."""
    pass


class OrderService:
    """Manages order creation, lifecycle state progression, and querying."""

    @staticmethod
    def create_order(db: Session, request: OrderCreateRequest) -> CADOrder:
        """Create a new manufacturing order from an approved indicative quote."""
        # Verify quote exists
        quote = db.scalar(select(CADQuote).where(CADQuote.id == request.quote_id))
        if not quote:
            raise OrderError(f"Cannot place order: Quote '{request.quote_id}' does not exist.")

        order_id = f"ord_{uuid.uuid4().hex[:14]}"
        now_utc = datetime.datetime.now(datetime.timezone.utc)
        iso_now = now_utc.isoformat()

        initial_history = [
            {
                "from_status": None,
                "to_status": OrderStatus.REQUESTED.value,
                "timestamp": iso_now,
                "notes": request.notes or "Order requested by customer.",
            }
        ]

        order = CADOrder(
            id=order_id,
            quote_id=quote.id,
            customer_name=request.customer_name,
            customer_email=request.customer_email,
            shipping_address=request.shipping_address,
            notes=request.notes,
            status=OrderStatus.REQUESTED.value,
            total_price=quote.total_price,
            currency=quote.currency,
            status_history=initial_history,
            created_at=now_utc,
            updated_at=now_utc,
        )

        db.add(order)
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def get_order(db: Session, order_id: str) -> CADOrder:
        """Fetch single order by unique identifier."""
        order = db.scalar(select(CADOrder).where(CADOrder.id == order_id))
        if not order:
            raise OrderNotFoundError(f"Order '{order_id}' was not found.")
        return order

    @staticmethod
    def list_orders(
        db: Session,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[CADOrder], int]:
        """Query orders with pagination and optional status filter."""
        query = select(CADOrder)
        count_query = select(func.count(CADOrder.id))

        if status:
            query = query.where(CADOrder.status == status)
            count_query = count_query.where(CADOrder.status == status)

        total = db.scalar(count_query) or 0
        items = db.scalars(query.order_by(CADOrder.created_at.desc()).offset(skip).limit(limit)).all()
        return list(items), total

    @staticmethod
    def update_order_status(
        db: Session,
        order_id: str,
        update_req: OrderStatusUpdateRequest,
    ) -> CADOrder:
        """Transition order through verified lifecycle state machine."""
        order = OrderService.get_order(db, order_id)
        current_status = OrderStatus(order.status)
        target_status = update_req.new_status

        if current_status == target_status:
            return order

        allowed = VALID_TRANSITIONS.get(current_status, [])
        if target_status not in allowed:
            allowed_str = ", ".join([s.value for s in allowed]) if allowed else "None (terminal state)"
            raise InvalidStateTransitionError(
                f"Illegal state transition from '{current_status.value}' to '{target_status.value}'. "
                f"Allowed target states from '{current_status.value}': [{allowed_str}]."
            )

        now_utc = datetime.datetime.now(datetime.timezone.utc)
        history_entry = {
            "from_status": current_status.value,
            "to_status": target_status.value,
            "timestamp": now_utc.isoformat(),
            "notes": update_req.notes or f"Transitioned to {target_status.value}.",
        }

        # Update order record
        order.status = target_status.value
        # Re-assign or clone list for SQLAlchemy JSON change detection
        updated_history = list(order.status_history) + [history_entry]
        order.status_history = updated_history
        order.updated_at = now_utc

        db.add(order)
        db.commit()
        db.refresh(order)
        return order
