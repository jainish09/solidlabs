"""API routes for 3D Design Marketplace operations."""

from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.schemas.marketplace import (
    ListingCreateRequest,
    ListingUpdateRequest,
    ListingPublishRequest,
    MarketplaceListingResponse,
    ListingListResponse,
    ListingCategory,
)
from app.services.marketplace_service import (
    MarketplaceService,
    MarketplaceError,
    ListingNotFoundError,
)
from app.services.design_service import DesignNotFoundError

router = APIRouter()


@router.post(
    "/marketplace/listings",
    response_model=MarketplaceListingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Draft Marketplace Listing",
    description="Registers an owned CAD asset as a draft listing in the SolidLabs manufacturing marketplace.",
)
def create_listing(
    request: ListingCreateRequest,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MarketplaceListingResponse:
    try:
        return MarketplaceService.create_listing(
            db=db,
            request=request,
            owner_id=current_user,
        )
    except DesignNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except MarketplaceError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/marketplace/listings",
    response_model=ListingListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Marketplace Designs",
    description="Browse published CAD design listings with search, category filtering, and pagination.",
)
def list_listings(
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status ('PUBLISHED', 'DRAFT')"),
    q: Optional[str] = Query(None, description="Search term matching title or description"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Page limit"),
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ListingListResponse:
    clean_cat = category.strip() if category and category.strip() else None
    clean_status = status.strip() if status and status.strip() else None
    clean_q = q.strip() if q and q.strip() else None
    items, total = MarketplaceService.list_listings(
        db=db,
        current_user=current_user,
        category=clean_cat,
        status_filter=clean_status,
        search_query=clean_q,
        skip=skip,
        limit=limit,
    )
    return ListingListResponse(items=items, total=total, skip=skip, limit=limit)


@router.get(
    "/marketplace/listings/{listing_id}",
    response_model=MarketplaceListingResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Marketplace Listing Details",
    description="Retrieve comprehensive listing details, manufacturing specifications, and CAD metadata.",
)
def get_listing_details(
    listing_id: str,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MarketplaceListingResponse:
    try:
        return MarketplaceService.get_listing(
            db=db,
            listing_id=listing_id,
            current_user=current_user,
        )
    except ListingNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch(
    "/marketplace/listings/{listing_id}",
    response_model=MarketplaceListingResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Marketplace Listing",
    description="Update permitted listing fields. Restricted to the listing owner.",
)
def update_listing(
    listing_id: str,
    payload: ListingUpdateRequest,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MarketplaceListingResponse:
    try:
        return MarketplaceService.update_listing(
            db=db,
            listing_id=listing_id,
            update_data=payload,
            current_user=current_user,
        )
    except ListingNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except MarketplaceError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/marketplace/listings/{listing_id}/publish",
    response_model=MarketplaceListingResponse,
    status_code=status.HTTP_200_OK,
    summary="Publish Marketplace Listing",
    description="Publishes a draft listing to the marketplace upon explicit intellectual property declaration.",
)
def publish_listing(
    listing_id: str,
    request: ListingPublishRequest,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MarketplaceListingResponse:
    try:
        return MarketplaceService.publish_listing(
            db=db,
            listing_id=listing_id,
            publish_req=request,
            current_user=current_user,
        )
    except ListingNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except MarketplaceError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/marketplace/listings/{listing_id}/archive",
    response_model=MarketplaceListingResponse,
    status_code=status.HTTP_200_OK,
    summary="Archive Marketplace Listing",
    description="Retires an owned listing from the public marketplace.",
)
def archive_listing(
    listing_id: str,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MarketplaceListingResponse:
    try:
        return MarketplaceService.archive_listing(
            db=db,
            listing_id=listing_id,
            current_user=current_user,
        )
    except ListingNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except MarketplaceError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
