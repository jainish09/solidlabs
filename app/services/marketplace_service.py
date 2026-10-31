"""Marketplace Service for managing 3D CAD design listings and publication."""

import datetime
import uuid
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_

from app.core.security import require_owner
from app.models.cad_asset import CADAsset, DesignRevision
from app.models.marketplace import MarketplaceListing
from app.schemas.marketplace import (
    ListingCreateRequest,
    ListingUpdateRequest,
    ListingPublishRequest,
    MarketplaceListingResponse,
)
from app.services.design_service import DesignService, DesignNotFoundError


class MarketplaceError(Exception):
    """Domain error for marketplace business logic."""
    pass


class ListingNotFoundError(MarketplaceError):
    """Raised when a marketplace listing is not found."""
    pass


class MarketplaceService:
    """Manages the creation, verification, search, and publication of marketplace listings."""

    @classmethod
    def create_listing(
        cls,
        db: Session,
        request: ListingCreateRequest,
        owner_id: str,
    ) -> MarketplaceListingResponse:
        """Create a new draft listing for an owned CAD asset."""
        asset = db.scalar(select(CADAsset).where(CADAsset.id == request.design_id))
        if not asset:
            raise DesignNotFoundError(f"Referenced CAD design '{request.design_id}' not found.")

        # Ensure creator owns the CAD asset
        require_owner(owner_id, asset.owner_id, action="create marketplace listing for")

        # Validate revision reference if supplied
        rev_id = request.revision_id
        if rev_id:
            rev = db.scalar(select(DesignRevision).where(DesignRevision.id == rev_id))
            if not rev or rev.design_id != asset.id:
                raise MarketplaceError(f"Revision '{rev_id}' does not belong to design '{asset.id}'.")

        listing_id = f"lst_{uuid.uuid4().hex[:14]}"
        now_utc = datetime.datetime.now(datetime.timezone.utc)

        listing = MarketplaceListing(
            id=listing_id,
            design_id=asset.id,
            revision_id=rev_id,
            owner_id=owner_id,
            title=request.title.strip(),
            description=request.description.strip(),
            category=request.category,
            tags=request.tags,
            license=request.license,
            indicative_price=float(request.indicative_price),
            currency=request.currency,
            material_options=request.material_options,
            manufacturing_processes=request.manufacturing_processes,
            listing_type=request.listing_type,
            status="DRAFT",
            ownership_confirmed=request.ownership_confirmed,
            takedown_status="active",
            created_at=now_utc,
            updated_at=now_utc,
            published_at=None,
        )

        db.add(listing)
        db.commit()
        db.refresh(listing)

        return cls._format_listing_response(db, listing)

    @classmethod
    def list_listings(
        cls,
        db: Session,
        current_user: Optional[str] = None,
        category: Optional[str] = None,
        status_filter: Optional[str] = None,
        search_query: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[MarketplaceListingResponse], int]:
        """Query listings with search, category filtering, and status isolation."""
        query = select(MarketplaceListing).where(MarketplaceListing.takedown_status != "removed")
        count_query = select(func.count(MarketplaceListing.id)).where(MarketplaceListing.takedown_status != "removed")

        # Visibility guard: Public callers only see PUBLISHED listings.
        # Authenticated owners may view their own DRAFT/ARCHIVED listings.
        if status_filter:
            if status_filter == "DRAFT":
                query = query.where(MarketplaceListing.status == "DRAFT", MarketplaceListing.owner_id == current_user)
                count_query = count_query.where(MarketplaceListing.status == "DRAFT", MarketplaceListing.owner_id == current_user)
            else:
                query = query.where(MarketplaceListing.status == status_filter)
                count_query = count_query.where(MarketplaceListing.status == status_filter)
        else:
            # Default: show PUBLISHED to everyone, plus DRAFT if owned by current user
            if current_user:
                query = query.where(
                    or_(
                        MarketplaceListing.status == "PUBLISHED",
                        MarketplaceListing.owner_id == current_user,
                    )
                )
                count_query = count_query.where(
                    or_(
                        MarketplaceListing.status == "PUBLISHED",
                        MarketplaceListing.owner_id == current_user,
                    )
                )
            else:
                query = query.where(MarketplaceListing.status == "PUBLISHED")
                count_query = count_query.where(MarketplaceListing.status == "PUBLISHED")

        if category:
            query = query.where(MarketplaceListing.category == category)
            count_query = count_query.where(MarketplaceListing.category == category)

        if search_query:
            term = f"%{search_query.strip()}%"
            query = query.where(
                or_(
                    MarketplaceListing.title.ilike(term),
                    MarketplaceListing.description.ilike(term),
                )
            )
            count_query = count_query.where(
                or_(
                    MarketplaceListing.title.ilike(term),
                    MarketplaceListing.description.ilike(term),
                )
            )

        total = db.scalar(count_query) or 0
        items = db.scalars(query.order_by(MarketplaceListing.created_at.desc()).offset(skip).limit(limit)).all()

        return [cls._format_listing_response(db, item) for item in items], total

    @classmethod
    def get_listing(cls, db: Session, listing_id: str, current_user: Optional[str] = None) -> MarketplaceListingResponse:
        """Fetch single listing details with visibility checks."""
        listing = db.scalar(select(MarketplaceListing).where(MarketplaceListing.id == listing_id))
        if not listing or listing.takedown_status == "removed":
            raise ListingNotFoundError(f"Marketplace listing '{listing_id}' was not found.")

        # If not published, only the owner may view
        if listing.status != "PUBLISHED":
            require_owner(current_user or "", listing.owner_id, action="view draft of")

        return cls._format_listing_response(db, listing)

    @classmethod
    def update_listing(
        cls,
        db: Session,
        listing_id: str,
        update_data: ListingUpdateRequest,
        current_user: str,
    ) -> MarketplaceListingResponse:
        """Update permitted fields for an owned listing."""
        listing = db.scalar(select(MarketplaceListing).where(MarketplaceListing.id == listing_id))
        if not listing:
            raise ListingNotFoundError(f"Marketplace listing '{listing_id}' was not found.")

        require_owner(current_user, listing.owner_id, action="update")

        if update_data.title is not None:
            listing.title = update_data.title.strip()
        if update_data.description is not None:
            listing.description = update_data.description.strip()
        if update_data.category is not None:
            listing.category = update_data.category
        if update_data.tags is not None:
            listing.tags = update_data.tags
        if update_data.license is not None:
            listing.license = update_data.license
        if update_data.indicative_price is not None:
            listing.indicative_price = float(update_data.indicative_price)
        if update_data.material_options is not None:
            listing.material_options = update_data.material_options
        if update_data.manufacturing_processes is not None:
            listing.manufacturing_processes = update_data.manufacturing_processes

        listing.updated_at = datetime.datetime.now(datetime.timezone.utc)
        db.add(listing)
        db.commit()
        db.refresh(listing)

        return cls._format_listing_response(db, listing)

    @classmethod
    def publish_listing(
        cls,
        db: Session,
        listing_id: str,
        publish_req: ListingPublishRequest,
        current_user: str,
    ) -> MarketplaceListingResponse:
        """Publish a draft listing upon explicit intellectual property confirmation."""
        listing = db.scalar(select(MarketplaceListing).where(MarketplaceListing.id == listing_id))
        if not listing:
            raise ListingNotFoundError(f"Marketplace listing '{listing_id}' was not found.")

        require_owner(current_user, listing.owner_id, action="publish")

        if not publish_req.confirm_ownership:
            raise MarketplaceError(
                "Publication rejected: You must affirmatively declare ownership or authorized distribution rights."
            )
        if not publish_req.accept_marketplace_terms:
            raise MarketplaceError("Publication rejected: You must accept marketplace distribution terms.")

        now_utc = datetime.datetime.now(datetime.timezone.utc)
        listing.status = "PUBLISHED"
        listing.ownership_confirmed = True
        listing.published_at = now_utc
        listing.updated_at = now_utc

        db.add(listing)
        db.commit()
        db.refresh(listing)

        return cls._format_listing_response(db, listing)

    @classmethod
    def archive_listing(
        cls,
        db: Session,
        listing_id: str,
        current_user: str,
    ) -> MarketplaceListingResponse:
        """Retire a listing from the active marketplace."""
        listing = db.scalar(select(MarketplaceListing).where(MarketplaceListing.id == listing_id))
        if not listing:
            raise ListingNotFoundError(f"Marketplace listing '{listing_id}' was not found.")

        require_owner(current_user, listing.owner_id, action="archive")

        listing.status = "ARCHIVED"
        listing.updated_at = datetime.datetime.now(datetime.timezone.utc)

        db.add(listing)
        db.commit()
        db.refresh(listing)

        return cls._format_listing_response(db, listing)

    @classmethod
    def _format_listing_response(cls, db: Session, listing: MarketplaceListing) -> MarketplaceListingResponse:
        design_resp = None
        if listing.design:
            design_resp = DesignService.get_design_asset(db, listing.design_id)

        return MarketplaceListingResponse(
            listing_id=listing.id,
            design_id=listing.design_id,
            revision_id=listing.revision_id,
            owner_id=listing.owner_id,
            title=listing.title,
            description=listing.description,
            category=listing.category,
            tags=listing.tags or [],
            license=listing.license,
            indicative_price=listing.indicative_price,
            currency=listing.currency,
            material_options=listing.material_options or [],
            manufacturing_processes=listing.manufacturing_processes or [],
            listing_type=listing.listing_type,
            status=listing.status,
            ownership_confirmed=listing.ownership_confirmed,
            takedown_status=listing.takedown_status,
            created_at=listing.created_at,
            updated_at=listing.updated_at,
            published_at=listing.published_at,
            design=design_resp,
        )
