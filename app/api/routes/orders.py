"""Manufacturing Order Management API Routes."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.order import (
    OrderCreateRequest,
    OrderStatusUpdateRequest,
    CADOrderResponse,
    OrderListResponse,
    StatusHistoryEntry,
    OrderStatus,
)
from app.schemas.quote import CADQuoteResponse, LineItem
from app.services.order_service import (
    OrderService,
    OrderError,
    OrderNotFoundError,
    InvalidStateTransitionError,
)

router = APIRouter()


@router.post(
    "/orders",
    response_model=CADOrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Manufacturing Order",
    description="Places a formal manufacturing order referencing an accepted indicative quote.",
)
def create_order(
    request: OrderCreateRequest,
    db: Session = Depends(get_db),
) -> CADOrderResponse:
    try:
        order = OrderService.create_order(db, request)
    except OrderError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return _format_order_response(order)


@router.get(
    "/orders",
    response_model=OrderListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Orders (Paginated)",
    description="Retrieve paginated list of manufacturing orders, optionally filtered by status.",
)
def list_orders(
    status_filter: Optional[OrderStatus] = Query(None, alias="status", description="Filter by lifecycle status"),
    skip: int = Query(0, ge=0, description="Offset number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Page record limit"),
    db: Session = Depends(get_db),
) -> OrderListResponse:
    filter_val = status_filter.value if status_filter else None
    items, total = OrderService.list_orders(db, status=filter_val, skip=skip, limit=limit)

    return OrderListResponse(
        items=[_format_order_response(order) for order in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/orders/{order_id}",
    response_model=CADOrderResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve Order Details",
    description="Get comprehensive manufacturing order status, audit history, and associated quote details.",
)
def get_order_by_id(
    order_id: str,
    db: Session = Depends(get_db),
) -> CADOrderResponse:
    try:
        order = OrderService.get_order(db, order_id)
    except OrderNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    return _format_order_response(order, include_quote=True)


@router.patch(
    "/orders/{order_id}/status",
    response_model=CADOrderResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Order Lifecycle Status",
    description=(
        "Transition order to next stage in the manufacturing workflow. "
        "Enforces strict state-machine rules (REQUESTED -> APPROVED -> IN_PRODUCTION -> QUALITY_CHECK -> DELIVERED). "
        "NOTE: Hackathon Prototype Notice: In production, this administrative endpoint requires RBAC authentication."
    ),
)
def update_order_status(
    order_id: str,
    request: OrderStatusUpdateRequest,
    db: Session = Depends(get_db),
) -> CADOrderResponse:
    try:
        updated_order = OrderService.update_order_status(db, order_id, request)
    except OrderNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except InvalidStateTransitionError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return _format_order_response(updated_order)


def _format_order_response(order, include_quote: bool = False) -> CADOrderResponse:
    quote_resp = None
    if include_quote and order.quote:
        q = order.quote
        quote_resp = CADQuoteResponse(
            quote_id=q.id,
            analysis_id=q.analysis_id,
            process=q.process,
            material=q.material,
            quantity=q.quantity,
            finish=q.finish,
            unit_price=q.unit_price,
            total_price=q.total_price,
            currency=q.currency,
            lead_time_business_days=q.lead_time_business_days,
            estimate_status=q.estimate_status,
            line_items=[LineItem(**item) for item in q.line_items],
            pricing_assumptions=q.pricing_assumptions,
            created_at=q.created_at,
        )

    return CADOrderResponse(
        order_id=order.id,
        quote_id=order.quote_id,
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        shipping_address=order.shipping_address,
        notes=order.notes,
        status=OrderStatus(order.status),
        total_price=order.total_price,
        currency=order.currency,
        status_history=[StatusHistoryEntry(**entry) for entry in order.status_history],
        created_at=order.created_at,
        updated_at=order.updated_at,
        quote=quote_resp,
    )
