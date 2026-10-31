"""Schemas for Indicative Quotation Requests and Responses."""

import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

SupportedProcess = Literal[
    "3d_printing_fdm",
    "3d_printing_sla",
    "3d_printing_sls",
    "cnc_machining_3axis",
]

SupportedMaterial = Literal[
    "pla",
    "abs",
    "petg",
    "nylon",
    "resin_standard",
    "aluminum_6061",
    "steel_1018",
    "stainless_304",
    "brass_360",
]


from pydantic import BaseModel, Field, model_validator


class QuoteCreateRequest(BaseModel):
    """Payload to request an indicative manufacturing quote based on a prior CAD analysis, design asset, or marketplace listing."""

    analysis_id: Optional[str] = Field(
        default=None,
        description="ID of previously completed CAD analysis",
        json_schema_extra={"example": "anl_1234567890abcdef"},
    )
    design_id: Optional[str] = Field(
        default=None,
        description="ID of CAD design asset or generated model to quote",
        json_schema_extra={"example": "cad_1234567890abcdef"},
    )
    listing_id: Optional[str] = Field(
        default=None,
        description="ID of marketplace listing to quote",
        json_schema_extra={"example": "lst_1234567890abcdef"},
    )
    process: SupportedProcess = Field(
        ...,
        description="Target manufacturing process",
        json_schema_extra={"example": "3d_printing_fdm"},
    )
    material: SupportedMaterial = Field(
        ...,
        description="Selected material",
        json_schema_extra={"example": "pla"},
    )
    quantity: int = Field(default=1, ge=1, le=100000, description="Quantity of parts to manufacture")
    finish: Optional[str] = Field(default="standard_as_machined", description="Surface finish or post-processing option")

    @model_validator(mode="after")
    def validate_reference(self) -> "QuoteCreateRequest":
        if not self.analysis_id and not self.design_id and not self.listing_id:
            raise ValueError("At least one of 'analysis_id', 'design_id', or 'listing_id' must be provided.")
        return self


class LineItem(BaseModel):
    """Individual transparent quotation line item."""

    item_name: str = Field(..., description="Name of cost component (e.g. Base Machine Setup, Material Stock)")
    description: str = Field(..., description="Engineering explanation or calculation formula")
    unit_cost: float = Field(..., description="Calculated cost per unit in USD")
    total_cost: float = Field(..., description="Total cost for specified quantity in USD")


class CADQuoteResponse(BaseModel):
    """Indicative quotation response schema."""

    quote_id: str = Field(..., description="Unique quotation ID")
    analysis_id: str = Field(..., description="Linked analysis record ID")
    design_id: Optional[str] = Field(None, description="Optional linked CAD design ID")
    listing_id: Optional[str] = Field(None, description="Optional linked marketplace listing ID")
    process: str = Field(..., description="Manufacturing process")
    material: str = Field(..., description="Selected raw material")
    quantity: int = Field(..., description="Ordered quantity")
    finish: Optional[str] = Field(None, description="Applied surface finish")
    unit_price: float = Field(..., description="Indicative unit price in currency")
    total_price: float = Field(..., description="Indicative total price in currency")
    currency: str = Field(default="USD", description="Quotation currency code")
    lead_time_business_days: int = Field(..., description="Estimated production lead time in business days")
    estimate_status: str = Field(
        default="indicative",
        description="Notice that pricing is an algorithmically computed indicative estimate subject to CAM review",
    )
    line_items: List[LineItem] = Field(..., description="Transparent itemized cost breakdown")
    pricing_assumptions: Dict[str, Any] = Field(
        ..., description="Explicit parameters and constants utilized for this calculation"
    )
    created_at: datetime.datetime = Field(..., description="Quotation generation timestamp")

