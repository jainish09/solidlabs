"""Pydantic schemas and strict validation rules for Parametric CAD Generation."""

import datetime
from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, model_validator
from app.schemas.analysis import GeometryProperties


class MountingPlateParameters(BaseModel):
    """Parameters for generating a rectangular mounting plate with 4 corner holes and optional bore."""

    length: float = Field(100.0, ge=15.0, le=1000.0, description="Length along X axis (mm)")
    width: float = Field(80.0, ge=15.0, le=1000.0, description="Width along Y axis (mm)")
    thickness: float = Field(8.0, ge=1.0, le=100.0, description="Plate thickness along Z axis (mm)")
    hole_diameter: float = Field(5.0, ge=1.5, le=50.0, description="Corner bolt hole diameter (mm)")
    hole_margin_x: float = Field(12.0, ge=4.0, le=200.0, description="Distance from X edges to hole centers (mm)")
    hole_margin_y: float = Field(12.0, ge=4.0, le=200.0, description="Distance from Y edges to hole centers (mm)")
    center_bore_diameter: Optional[float] = Field(None, ge=2.0, le=400.0, description="Optional central through-bore (mm)")

    @model_validator(mode="after")
    def validate_hole_clearances(self):
        if self.hole_margin_x * 2 >= self.length:
            raise ValueError(f"Hole margin X ({self.hole_margin_x}mm) must be less than half the plate length ({self.length}mm).")
        if self.hole_margin_y * 2 >= self.width:
            raise ValueError(f"Hole margin Y ({self.hole_margin_y}mm) must be less than half the plate width ({self.width}mm).")
        if self.hole_diameter >= self.hole_margin_x * 2 or self.hole_diameter >= self.hole_margin_y * 2:
            raise ValueError(f"Hole diameter ({self.hole_diameter}mm) exceeds edge margin bounds.")
        if self.center_bore_diameter:
            max_bore = min(self.length - 2 * self.hole_margin_x, self.width - 2 * self.hole_margin_y)
            if self.center_bore_diameter >= max_bore:
                raise ValueError(f"Center bore diameter ({self.center_bore_diameter}mm) interferes with bolt holes or plate boundaries.")
        return self


class SimpleBracketParameters(BaseModel):
    """Parameters for generating an L-shaped structural angle bracket."""

    leg1_length: float = Field(50.0, ge=15.0, le=500.0, description="Length of horizontal leg (mm)")
    leg2_length: float = Field(50.0, ge=15.0, le=500.0, description="Height of vertical leg (mm)")
    width: float = Field(35.0, ge=10.0, le=300.0, description="Bracket depth/width (mm)")
    thickness: float = Field(5.0, ge=1.5, le=40.0, description="Material wall thickness (mm)")
    hole_diameter: Optional[float] = Field(5.0, ge=2.0, le=30.0, description="Fastener hole diameter in each leg (mm)")

    @model_validator(mode="after")
    def validate_bracket_proportions(self):
        if self.thickness >= self.leg1_length * 0.6 or self.thickness >= self.leg2_length * 0.6:
            raise ValueError("Bracket thickness is excessively thick relative to leg lengths.")
        if self.hole_diameter and self.hole_diameter >= self.width * 0.7:
            raise ValueError(f"Hole diameter ({self.hole_diameter}mm) exceeds structural width ({self.width}mm).")
        return self


class SpacerParameters(BaseModel):
    """Parameters for generating a cylindrical spacer / bushing."""

    outer_diameter: float = Field(25.0, ge=6.0, le=300.0, description="Outer diameter (mm)")
    inner_diameter: float = Field(10.0, ge=2.0, le=280.0, description="Inner bore diameter (mm)")
    height: float = Field(15.0, ge=2.0, le=500.0, description="Total axial spacer height (mm)")

    @model_validator(mode="after")
    def validate_diameters(self):
        if self.inner_diameter >= self.outer_diameter - 1.0:
            raise ValueError(
                f"Inner diameter ({self.inner_diameter}mm) must be at least 1mm smaller than outer diameter ({self.outer_diameter}mm) for structural integrity."
            )
        return self


class CylindricalAdapterParameters(BaseModel):
    """Parameters for generating a stepped cylindrical shaft / adapter with through-hole."""

    base_diameter: float = Field(40.0, ge=10.0, le=400.0, description="Flange / base diameter (mm)")
    base_length: float = Field(15.0, ge=5.0, le=300.0, description="Flange length (mm)")
    stem_diameter: float = Field(24.0, ge=6.0, le=350.0, description="Mating shaft / stem diameter (mm)")
    stem_length: float = Field(25.0, ge=5.0, le=300.0, description="Stem length (mm)")
    bore_diameter: Optional[float] = Field(12.0, ge=2.0, le=300.0, description="Central through-bore (mm)")

    @model_validator(mode="after")
    def validate_stepped_shaft(self):
        if self.stem_diameter >= self.base_diameter - 1.0:
            raise ValueError(f"Stem diameter ({self.stem_diameter}mm) must be smaller than base diameter ({self.base_diameter}mm).")
        if self.bore_diameter and self.bore_diameter >= self.stem_diameter - 1.0:
            raise ValueError(f"Bore diameter ({self.bore_diameter}mm) exceeds stem wall thickness.")
        return self


SupportedTemplateType = Literal[
    "mounting_plate",
    "simple_bracket",
    "spacer",
    "cylindrical_adapter",
]


class DesignGenerateRequest(BaseModel):
    """Payload to request parametric 3D CAD model generation from text and template."""

    prompt: str = Field(..., min_length=3, max_length=2048, description="Natural language component description and engineering intent")
    template_type: SupportedTemplateType = Field(..., description="Component family from supported library")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Explicit dimensional parameters override (if omitted, AI extracts from prompt)")
    units: str = Field(default="mm", description="Dimensional units assumption (mm)")
    material_preference: Optional[str] = Field(None, description="Target raw material recommendation")
    name: Optional[str] = Field(None, max_length=128, description="Custom name for generated CAD asset")


class DesignGenerateResponse(BaseModel):
    """Response payload for generated parametric CAD geometry."""

    design_id: str = Field(..., description="Unique CAD asset identifier")
    revision_id: str = Field(..., description="Initial revision ID")
    template_type: str = Field(..., description="Component template utilized")
    parameters: Dict[str, Any] = Field(..., description="Validated mechanical parameter specification")
    units: str = Field(..., description="Measurement units")
    geometry: GeometryProperties = Field(..., description="Measured physical geometry properties")
    preview_url: str = Field(..., description="URL to retrieve asset metadata")
    export_stl_url: str = Field(..., description="Direct STL download link")
    export_step_url: str = Field(..., description="Direct STEP download link")
    created_at: datetime.datetime = Field(..., description="Timestamp of generation")


class DesignTransformRequest(BaseModel):
    """Payload to request an AI-assisted 3D geometric transformation on an existing CAD design."""

    prompt: str = Field(..., min_length=3, max_length=2048, description="Natural language description of desired 3D modification")
    operation: Optional[str] = Field(None, description="Explicit CAD operation override (e.g., 'scale_geometry', 'thicken_dimension', 'add_mounting_holes', 'cut_hole', 'rotate_geometry', 'translate_geometry', 'make_stronger', 'optimize_for_3d_printing', 'parametric_variation')")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Operational parameters override (factor, delta_mm, hole_diameter, hole_count, axis, angle_deg, etc.)")
    units: str = Field(default="mm", description="Measurement units")
    manufacturing_process: str = Field(default="3d_printing_fdm", description="Target manufacturing process context")
    material: str = Field(default="pla", description="Target material")
    constraints: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Manufacturing and dimensional constraints")


class DesignTransformResponse(BaseModel):
    """Result of real 3D geometric transformation with dual-geometry metrics and export links."""

    success: bool = Field(..., description="Whether the CAD transformation succeeded")
    design_id: str = Field(..., description="Target CAD asset ID")
    original_revision_id: str = Field(..., description="Baseline original revision ID")
    new_revision_id: Optional[str] = Field(None, description="Newly created immutable revision ID")
    new_revision_number: Optional[int] = Field(None, description="Sequential revision number (e.g. 2)")
    operation_performed: str = Field(..., description="Specific CAD/mesh operation executed")
    change_summary: str = Field(..., description="Human and machine-readable engineering explanation of geometric changes")
    original_geometry: Dict[str, Any] = Field(..., description="Baseline geometry metrics (bounding box, volume, triangles)")
    generated_geometry: Optional[Dict[str, Any]] = Field(None, description="Newly synthesized geometry metrics")
    comparison_delta: Optional[Dict[str, Any]] = Field(None, description="Delta report (volume change %, dimensional change, etc.)")
    model_url: Optional[str] = Field(None, description="Direct URL for 3D viewer retrieval")
    download_stl_url: Optional[str] = Field(None, description="Direct STL download URL")
    download_step_url: Optional[str] = Field(None, description="STEP download URL (if supported by kernel)")
    validation: Dict[str, Any] = Field(default_factory=dict, description="Watertight manifold integrity and volume validation")
    error_message: Optional[str] = Field(None, description="Helpful error explanation if operation could not be executed")
    supported_alternatives: Optional[list] = Field(None, description="List of supported feasible operations if requested operation was unsupported")
    created_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
