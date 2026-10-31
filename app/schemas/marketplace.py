"""Pydantic schemas for Manufacturing Marketplace Listings."""

import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field
from app.schemas.cad_asset import CADAssetResponse

ListingCategory = Literal[
    "mechanical_components",
    "enclosures",
    "brackets_mounts",
    "robotics",
    "tooling",
    "other",
]

ListingType = Literal[
    "digital_design",
    "physical_part",
]


class ListingCreateRequest(BaseModel):
    """Payload to create a draft marketplace listing for an owned CAD asset."""

    design_id: str = Field(..., description="ID of registered CAD asset to publish")
    revision_id: Optional[str] = Field(None, description="Optional specific revision ID (defaults to latest)")
    title: str = Field(..., min_length=3, max_length=255, description="Marketplace listing title")
    description: str = Field(..., min_length=10, max_length=4096, description="Engineering overview and usage guide")
    category: ListingCategory = Field(default="mechanical_components", description="Component category")
    tags: List[str] = Field(default_factory=list, description="Keywords for search discovery")
    license: str = Field(default="CC-BY-4.0", description="IP licensing terms (e.g. CC-BY-4.0, MIT, Proprietary)")
    indicative_price: float = Field(default=0.0, ge=0.0, description="Indicative base price in currency")
    currency: str = Field(default="USD", description="Currency code")
    material_options: List[str] = Field(default_factory=list, description="Supported manufacturing materials")
    manufacturing_processes: List[str] = Field(default_factory=list, description="Compatible fabrication processes")
    listing_type: ListingType = Field(default="digital_design", description="'digital_design' (CAD file) vs 'physical_part'")
    ownership_confirmed: bool = Field(default=False, description="Declaration of ownership or authorized distribution rights")


class ListingUpdateRequest(BaseModel):
    """Payload to update permitted listing fields prior to or after publishing."""

    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, min_length=10, max_length=4096)
    category: Optional[ListingCategory] = None
    tags: Optional[List[str]] = None
    license: Optional[str] = None
    indicative_price: Optional[float] = Field(None, ge=0.0)
    material_options: Optional[List[str]] = None
    manufacturing_processes: Optional[List[str]] = None


class ListingPublishRequest(BaseModel):
    """Owner confirmation required to transition a draft listing to published status."""

    confirm_ownership: bool = Field(..., description="Affirmative declaration that user holds intellectual property or distribution rights")
    accept_marketplace_terms: bool = Field(default=True, description="Acceptance of platform distribution terms")



class MarketplaceListingResponse(BaseModel):
    """Complete marketplace listing details."""

    listing_id: str = Field(..., description="Unique listing identifier")
    design_id: str = Field(..., description="Referenced CAD asset ID")
    revision_id: Optional[str] = Field(None, description="Specific revision ID")
    owner_id: str = Field(..., description="Listing creator identifier")
    title: str = Field(..., description="Title")
    description: str = Field(..., description="Description")
    category: str = Field(..., description="Category")
    tags: List[str] = Field(default_factory=list, description="Search tags")
    license: str = Field(..., description="License code")
    indicative_price: float = Field(..., description="Base indicative price")
    currency: str = Field(..., description="Currency")
    material_options: List[str] = Field(default_factory=list, description="Supported materials")
    manufacturing_processes: List[str] = Field(default_factory=list, description="Supported processes")
    listing_type: str = Field(..., description="Digital CAD vs Physical fabrication listing")
    status: str = Field(..., description="'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SUSPENDED'")
    ownership_confirmed: bool = Field(..., description="Legal ownership declaration state")
    takedown_status: str = Field(..., description="'active' | 'reported' | 'removed'")
    created_at: datetime.datetime = Field(..., description="Creation timestamp")
    updated_at: datetime.datetime = Field(..., description="Last modification timestamp")
    published_at: Optional[datetime.datetime] = Field(None, description="Timestamp when published")
    design: Optional[CADAssetResponse] = Field(None, description="Linked CAD asset metadata")


class ListingListResponse(BaseModel):
    """Paginated response of marketplace listings."""

    items: List[MarketplaceListingResponse] = Field(..., description="List of listings")
    total: int = Field(..., description="Total matching items count")
    skip: int = Field(..., description="Offset pagination")
    limit: int = Field(..., description="Page limit")
