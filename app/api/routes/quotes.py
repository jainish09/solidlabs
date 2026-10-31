"""Indicative Quotation API Routes."""

import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.db.session import get_db
from app.models.analysis import CADAnalysis
from app.models.quote import CADQuote
from app.models.cad_asset import CADAsset
from app.models.marketplace import MarketplaceListing
from app.schemas.quote import (
    QuoteCreateRequest,
    CADQuoteResponse,
    LineItem,
)
from app.services.pricing_service import PricingService, PricingError

router = APIRouter()


@router.post(
    "/quotes",
    response_model=CADQuoteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate Indicative Manufacturing Quotation",
    description=(
        "Calculates transparent indicative pricing based on measured geometry, "
        "manufacturing process physics (additive vs CNC milling), material density, "
        "machine setup, runtime rates, and quantity amortization. "
        "Supports direct analysis_id, design_id, or marketplace listing_id references."
    ),
)
def create_quote(
    request: QuoteCreateRequest,
    db: Session = Depends(get_db),
) -> CADQuoteResponse:
    target_analysis_id: Optional[str] = request.analysis_id
    resolved_design_id: Optional[str] = request.design_id
    resolved_listing_id: Optional[str] = request.listing_id

    # If listing_id is provided, resolve design and analysis
    if request.listing_id:
        listing = db.scalar(select(MarketplaceListing).where(MarketplaceListing.id == request.listing_id))
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Referenced marketplace listing '{request.listing_id}' was not found.",
            )
        resolved_design_id = listing.design_id
        design = db.scalar(select(CADAsset).where(CADAsset.id == listing.design_id))
        if not design or not design.analysis_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Marketplace listing '{request.listing_id}' does not have an associated geometric analysis.",
            )
        target_analysis_id = design.analysis_id

    # If design_id is provided directly
    elif request.design_id:
        design = db.scalar(select(CADAsset).where(CADAsset.id == request.design_id))
        if not design:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Referenced CAD design '{request.design_id}' was not found.",
            )
        if not design.analysis_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"CAD design '{request.design_id}' does not have an associated geometric analysis.",
            )
        target_analysis_id = design.analysis_id

    if not target_analysis_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid 'analysis_id', 'design_id', or 'listing_id' must be provided.",
        )

    # Look up analysis record
    analysis = db.scalar(select(CADAnalysis).where(CADAnalysis.id == target_analysis_id))
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Referenced CAD analysis '{target_analysis_id}' was not found.",
        )

    # Format analysis data dict for pricing engine
    analysis_dict = {
        "analysis_id": analysis.id,
        "geometry": {
            "bounding_box": {
                "x": analysis.dimension_x,
                "y": analysis.dimension_y,
                "z": analysis.dimension_z,
            },
            "surface_area_mm2": analysis.surface_area_mm2,
            "volume_mm3": analysis.volume_mm3,
            "is_watertight": analysis.is_watertight,
            "is_volume_valid": analysis.is_volume_valid,
            "triangle_count": analysis.triangle_count,
        },
    }

    try:
        quote_calc = PricingService.calculate_quote(analysis_dict, request)
    except PricingError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    # Attach linked references to pricing assumptions
    if resolved_design_id:
        quote_calc["pricing_assumptions"]["design_id"] = resolved_design_id
    if resolved_listing_id:
        quote_calc["pricing_assumptions"]["listing_id"] = resolved_listing_id

    quote_id = f"qte_{uuid.uuid4().hex[:14]}"
    now_utc = datetime.datetime.now(datetime.timezone.utc)

    db_quote = CADQuote(
        id=quote_id,
        analysis_id=analysis.id,
        process=quote_calc["process"],
        material=quote_calc["material"],
        quantity=quote_calc["quantity"],
        finish=quote_calc["finish"],
        unit_price=quote_calc["unit_price"],
        total_price=quote_calc["total_price"],
        currency=quote_calc["currency"],
        lead_time_business_days=quote_calc["lead_time_business_days"],
        estimate_status=quote_calc["estimate_status"],
        line_items=quote_calc["line_items"],
        pricing_assumptions=quote_calc["pricing_assumptions"],
        created_at=now_utc,
    )

    db.add(db_quote)
    db.commit()
    db.refresh(db_quote)

    return CADQuoteResponse(
        quote_id=db_quote.id,
        analysis_id=db_quote.analysis_id,
        design_id=resolved_design_id,
        listing_id=resolved_listing_id,
        process=db_quote.process,
        material=db_quote.material,
        quantity=db_quote.quantity,
        finish=db_quote.finish,
        unit_price=db_quote.unit_price,
        total_price=db_quote.total_price,
        currency=db_quote.currency,
        lead_time_business_days=db_quote.lead_time_business_days,
        estimate_status=db_quote.estimate_status,
        line_items=[LineItem(**item) for item in db_quote.line_items],
        pricing_assumptions=db_quote.pricing_assumptions,
        created_at=db_quote.created_at,
    )



@router.get(
    "/quotes/{quote_id}",
    response_model=CADQuoteResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve Quotation",
    description="Fetch previously calculated indicative quotation by quote ID.",
)
def get_quote_by_id(
    quote_id: str,
    db: Session = Depends(get_db),
) -> CADQuoteResponse:
    quote = db.scalar(select(CADQuote).where(CADQuote.id == quote_id))
    if not quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quotation '{quote_id}' was not found.",
        )

    return CADQuoteResponse(
        quote_id=quote.id,
        analysis_id=quote.analysis_id,
        process=quote.process,
        material=quote.material,
        quantity=quote.quantity,
        finish=quote.finish,
        unit_price=quote.unit_price,
        total_price=quote.total_price,
        currency=quote.currency,
        lead_time_business_days=quote.lead_time_business_days,
        estimate_status=quote.estimate_status,
        line_items=[LineItem(**item) for item in quote.line_items],
        pricing_assumptions=quote.pricing_assumptions,
        created_at=quote.created_at,
    )
