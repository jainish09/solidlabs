"""Pydantic schemas for CAD Assets and Revisions."""

import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.analysis import GeometryProperties, CADAnalysisResponse


class DesignRevisionResponse(BaseModel):
    """Schema representing an immutable CAD design revision."""

    revision_id: str = Field(..., description="Unique revision identifier")
    design_id: str = Field(..., description="Parent CAD asset ID")
    revision_number: int = Field(..., description="Sequential revision index")
    file_format: str = Field(..., description="Format extension ('stl', 'step')")
    file_hash: str = Field(..., description="SHA-256 integrity hash")
    file_size_bytes: int = Field(..., description="File size in bytes")
    change_summary: str = Field(..., description="Description of modifications made in this revision")
    operation_history: List[Dict[str, Any]] = Field(default_factory=list, description="List of executed CAD operations")
    geometry_snapshot: Dict[str, Any] = Field(default_factory=dict, description="Snapshot of calculated geometry metrics")
    created_at: datetime.datetime = Field(..., description="Revision creation timestamp")
    download_url: str = Field(..., description="Direct export download URL")


class CADAssetResponse(BaseModel):
    """Schema representing a registered CAD design asset."""

    design_id: str = Field(..., description="Unique design asset identifier")
    owner_id: str = Field(..., description="Owner identifier")
    name: str = Field(..., description="Design name")
    description: Optional[str] = Field(None, description="Detailed design notes")
    source_type: str = Field(..., description="'upload' | 'generated' | 'revised'")
    file_format: str = Field(..., description="Native format ('stl', 'step')")
    file_hash: str = Field(..., description="SHA-256 hash of active file")
    file_size_bytes: int = Field(..., description="Size in bytes")
    analysis_id: Optional[str] = Field(None, description="Linked CADAnalysis ID")
    geometry: Optional[GeometryProperties] = Field(None, description="Computed geometry metrics")
    revisions_count: int = Field(default=1, description="Number of historical revisions")
    preview_url: str = Field(..., description="Metadata inspection URL")
    export_stl_url: str = Field(..., description="URL to download STL geometry")
    export_step_url: str = Field(..., description="URL to download STEP geometry")
    created_at: datetime.datetime = Field(..., description="Asset registration timestamp")
    updated_at: datetime.datetime = Field(..., description="Last modification timestamp")


class CADUploadResponse(BaseModel):
    """Response payload when uploading a new CAD asset."""

    design: CADAssetResponse = Field(..., description="Registered CAD asset")
    initial_revision: DesignRevisionResponse = Field(..., description="Initial v1 revision snapshot")
    analysis: Optional[CADAnalysisResponse] = Field(None, description="Full geometric and DFM analysis results")
