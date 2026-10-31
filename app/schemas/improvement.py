"""Pydantic schemas for AI-Assisted CAD Design Improvements."""

import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.cad_asset import DesignRevisionResponse


class ModificationProposal(BaseModel):
    """Structured design modification proposed by the AI engineering engine."""

    operation: str = Field(..., description="Actionable CAD operation (e.g., 'fillet_corners', 'thicken_walls', 'scale_geometry')")
    target_feature: str = Field(..., description="Target geometry region or feature")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Operational parameters (e.g., radius, factor, delta_mm)")
    engineering_rationale: str = Field(..., description="Technical defense of why this improves manufacturability or strength")
    is_executable: bool = Field(..., description="Whether this operation can be safely executed on the current CAD representation")
    feasibility_impact: str = Field(..., description="Anticipated impact on production cost, time, and defect risk")


class ImprovementRequestPayload(BaseModel):
    """Payload to request an AI-assisted design improvement plan."""

    user_requirements: str = Field(..., min_length=5, max_length=2048, description="Target objectives (e.g., 'reduce print warpage', 'increase stiffness', 'reduce mass by 15%')")
    intended_application: str = Field(..., min_length=3, max_length=512, description="Functional context (e.g., 'Drone motor mount', 'High-heat engine bracket')")
    manufacturing_process: str = Field(default="3d_printing_fdm", description="Target process (3d_printing_fdm, cnc_machining_3axis, etc.)")
    material: str = Field(default="pla", description="Candidate material (pla, abs, aluminum_6061, etc.)")
    constraints: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Fixed constraints (e.g., max_outer_dimension, bolt_clearances)")
    execute_modifications: bool = Field(default=False, description="Whether to execute feasible parameterized CAD operations and generate a new revision")


class ImprovementPlanResponse(BaseModel):
    """Structured revision proposal and execution report."""

    improvement_id: str = Field(..., description="Unique improvement request ID")
    design_id: str = Field(..., description="Target CAD asset ID")
    status: str = Field(..., description="'PLANNED' | 'REVISED' | 'REJECTED'")
    observations: List[str] = Field(default_factory=list, description="Direct deductions from actual measured geometry and DFM results")
    assumptions: List[str] = Field(default_factory=list, description="Explicit mechanical and operational assumptions")
    proposed_modifications: List[ModificationProposal] = Field(default_factory=list, description="Itemized engineering improvements")
    feasibility_assessment: Dict[str, Any] = Field(default_factory=dict, description="Summary evaluation of manufacturing suitability")
    executed_revision: Optional[DesignRevisionResponse] = Field(None, description="Newly generated revision if modifications were executed")
    comparison_report: Optional[Dict[str, Any]] = Field(None, description="Geometric delta between original and revised model")
    created_at: datetime.datetime = Field(..., description="Proposal generation timestamp")
