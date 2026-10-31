"""Schemas for CAD File Analysis and DFM Findings."""

import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    """3D Axis-Aligned Bounding Box dimensions in configured units."""

    x: float = Field(..., description="Size along X axis (mm)")
    y: float = Field(..., description="Size along Y axis (mm)")
    z: float = Field(..., description="Size along Z axis (mm)")


class GeometryProperties(BaseModel):
    """Extracted physical and topological geometric properties."""

    bounding_box: BoundingBox = Field(..., description="Axis-aligned bounding box")
    surface_area_mm2: Optional[float] = Field(None, description="Total outer surface area in mm^2")
    volume_mm3: Optional[float] = Field(None, description="Enclosed volume in mm^3, null if non-watertight")
    triangle_count: int = Field(..., description="Number of polygonal faces/triangles in mesh")
    is_watertight: bool = Field(..., description="Whether mesh forms a closed manifold boundary shell")
    is_volume_valid: bool = Field(..., description="True only if watertight and mathematically positive volume")


class DFMFindingSchema(BaseModel):
    """Design For Manufacturing check finding or heuristic alert."""

    check_code: str = Field(..., description="Machine-readable code, e.g. DFM_NON_WATERTIGHT")
    check_name: str = Field(..., description="Human-readable title of check")
    category: Literal["geometry_integrity", "manufacturing_limit", "heuristic", "machinability"] = Field(
        ..., description="Check categorization"
    )
    severity: Literal["info", "warning", "critical"] = Field(..., description="Severity level")
    passed: bool = Field(..., description="True if rule requirements were met")
    explanation: str = Field(..., description="Clear engineering explanation of the check result")
    evidence: Dict[str, Any] = Field(default_factory=dict, description="Numerical measurements and comparison criteria")
    suggested_action: str = Field(..., description="Actionable recommendation for the CAD designer")


class CADAnalysisResponse(BaseModel):
    """Complete response payload for CAD STL upload and analysis."""

    analysis_id: str = Field(..., description="Unique analysis record identifier")
    filename: str = Field(..., description="Sanitized original filename")
    file_size_bytes: int = Field(..., description="Uploaded file size in bytes")
    file_hash: str = Field(..., description="SHA-256 integrity checksum")
    units: str = Field(default="mm", description="Explicit measurement units assumption (default mm)")
    geometry: GeometryProperties = Field(..., description="Geometric properties")
    warnings: List[str] = Field(default_factory=list, description="General mesh parsing warnings")
    dfm_findings: List[DFMFindingSchema] = Field(default_factory=list, description="DFM evaluation findings")
    ai_explanation: Optional[str] = Field(None, description="Optional AI-generated engineering synthesis")
    created_at: datetime.datetime = Field(..., description="UTC creation timestamp")
