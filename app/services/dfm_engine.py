"""Design for Manufacturing (DFM) Rule Engine.

Provides deterministic, technically defensible evaluations of 3D geometry against
manufacturing process envelopes and mechanical design constraints.

Key Principles:
- Clear separation between actual geometric findings and heuristic indicators.
- Explicit disclaimers on limits of polygonal STL analysis vs native CAD B-Rep.
- Watertightness is checked for slicing/volume validity, but explicitly noted
  as NOT guaranteeing full manufacturability on its own.
"""

from typing import Dict, Any, List, Optional
from app.schemas.analysis import DFMFindingSchema

# Configurable build envelope and capability limits per manufacturing process
PROCESS_LIMITS = {
    "3d_printing_fdm": {
        "name": "Fused Deposition Modeling (FDM) 3D Printing",
        "max_x_mm": 250.0,
        "max_y_mm": 250.0,
        "max_z_mm": 300.0,
        "min_recommended_thickness_mm": 1.2,
        "max_aspect_ratio": 12.0,
        "requires_watertight": True,
    },
    "3d_printing_sla": {
        "name": "Stereolithography (SLA) Photopolymer 3D Printing",
        "max_x_mm": 145.0,
        "max_y_mm": 145.0,
        "max_z_mm": 175.0,
        "min_recommended_thickness_mm": 0.8,
        "max_aspect_ratio": 10.0,
        "requires_watertight": True,
    },
    "3d_printing_sls": {
        "name": "Selective Laser Sintering (SLS) Nylon 3D Printing",
        "max_x_mm": 300.0,
        "max_y_mm": 300.0,
        "max_z_mm": 300.0,
        "min_recommended_thickness_mm": 1.0,
        "max_aspect_ratio": 15.0,
        "requires_watertight": True,
    },
    "cnc_machining_3axis": {
        "name": "CNC 3-Axis Precision Milling",
        "max_x_mm": 600.0,
        "max_y_mm": 400.0,
        "max_z_mm": 300.0,
        "min_recommended_thickness_mm": 1.5,
        "max_aspect_ratio": 15.0,
        "requires_watertight": False,  # CAM can project toolpaths over open surfaces, though closed solids are preferred
    },
}


class DFMEngine:
    """Evaluates geometric properties against manufacturing rule-sets."""

    @classmethod
    def evaluate(
        cls,
        geometry: Dict[str, Any],
        process: str = "3d_printing_fdm",
        custom_limits: Optional[Dict[str, Any]] = None,
    ) -> List[DFMFindingSchema]:
        """Run all applicable DFM checks for the given geometry and process.

        Args:
            geometry: Extracted geometry dict (bounding box, volume, triangle count, etc.)
            process: Manufacturing process key
            custom_limits: Optional overrides for process limits

        Returns:
            List of DFMFindingSchema objects
        """
        limits = dict(PROCESS_LIMITS.get(process, PROCESS_LIMITS["3d_printing_fdm"]))
        if custom_limits:
            limits.update(custom_limits)

        findings: List[DFMFindingSchema] = []

        bb = geometry.get("bounding_box", {})
        dim_x = float(bb.get("x", 0.0))
        dim_y = float(bb.get("y", 0.0))
        dim_z = float(bb.get("z", 0.0))
        is_watertight = bool(geometry.get("is_watertight", False))
        is_volume_valid = bool(geometry.get("is_volume_valid", False))
        triangle_count = int(geometry.get("triangle_count", 0))

        # Check 1: Mesh Topology & Watertightness
        findings.append(cls._check_watertightness(is_watertight, is_volume_valid, process))

        # Check 2: Build Volume / Machine Envelope Limits
        findings.append(cls._check_build_volume(dim_x, dim_y, dim_z, limits, process))

        # Check 3: Aspect Ratio and Slenderness
        findings.append(cls._check_aspect_ratio(dim_x, dim_y, dim_z, limits))

        # Check 4: Mesh Resolution and Facet Density
        findings.append(cls._check_mesh_resolution(triangle_count, dim_x, dim_y, dim_z))

        # Check 5: Minimum Feature Envelope Heuristic
        findings.append(cls._check_minimum_thickness_heuristic(dim_x, dim_y, dim_z, limits))

        # Check 6: Explicit Statement on Unsupported STL Checks (Tool access, draft angles, threads)
        findings.append(cls._check_unsupported_capabilities(process))

        return findings

    @staticmethod
    def _check_watertightness(is_watertight: bool, is_volume_valid: bool, process: str) -> DFMFindingSchema:
        is_additive = "3d_printing" in process
        if is_watertight and is_volume_valid:
            return DFMFindingSchema(
                check_code="DFM_MESH_WATERTIGHT",
                check_name="Solid Manifold Topology",
                category="geometry_integrity",
                severity="info",
                passed=True,
                explanation=(
                    "Mesh is a closed 2-manifold surface shell with mathematically consistent volume. "
                    "Important note: Watertightness is a prerequisite for slicing and volume estimation, "
                    "but does not guarantee complete structural or feature manufacturability."
                ),
                evidence={"is_watertight": True, "is_volume_valid": True},
                suggested_action="No topological mesh repair required.",
            )
        else:
            return DFMFindingSchema(
                check_code="DFM_NON_WATERTIGHT",
                check_name="Non-Watertight / Open Boundary Mesh",
                category="geometry_integrity",
                severity="critical" if is_additive else "warning",
                passed=False,
                explanation=(
                    "Mesh contains open boundary edges, missing faces, or non-manifold vertices. "
                    "In 3D printing, slicers may produce missing layers or fill interiors unpredictably. "
                    "In CAM milling, closed solid verification is compromised."
                ),
                evidence={"is_watertight": is_watertight, "is_volume_valid": is_volume_valid},
                suggested_action=(
                    "Repair mesh in CAD software or run a polygon stitch/hole-filling routine "
                    "prior to final G-code generation."
                ),
            )

    @staticmethod
    def _check_build_volume(
        dim_x: float, dim_y: float, dim_z: float, limits: Dict[str, Any], process: str
    ) -> DFMFindingSchema:
        max_x = limits.get("max_x_mm", 250.0)
        max_y = limits.get("max_y_mm", 250.0)
        max_z = limits.get("max_z_mm", 300.0)

        # In manufacturing, parts can be oriented in multiple axes to fit build envelopes.
        # Check sorted extents vs sorted limits for best-fit orientation
        part_dims_sorted = sorted([dim_x, dim_y, dim_z], reverse=True)
        env_dims_sorted = sorted([max_x, max_y, max_z], reverse=True)

        fits_envelope = (
            part_dims_sorted[0] <= env_dims_sorted[0]
            and part_dims_sorted[1] <= env_dims_sorted[1]
            and part_dims_sorted[2] <= env_dims_sorted[2]
        )

        evidence = {
            "part_extents_mm": {"x": dim_x, "y": dim_y, "z": dim_z},
            "machine_envelope_mm": {"x": max_x, "y": max_y, "z": max_z},
            "fits_with_optimal_rotation": fits_envelope,
        }

        if fits_envelope:
            return DFMFindingSchema(
                check_code="DFM_BUILD_VOLUME_OK",
                check_name="Machine Working Envelope Compliance",
                category="manufacturing_limit",
                severity="info",
                passed=True,
                explanation=f"Part dimensions fit within the standard working volume for {limits.get('name')}.",
                evidence=evidence,
                suggested_action="Proceed with planned process envelope.",
            )
        else:
            return DFMFindingSchema(
                check_code="DFM_BUILD_VOLUME_EXCEEDED",
                check_name="Machine Working Envelope Exceeded",
                category="manufacturing_limit",
                severity="critical",
                passed=False,
                explanation=(
                    f"Part extents ({dim_x} x {dim_y} x {dim_z} mm) exceed the physical maximum working volume "
                    f"of {limits.get('name')} ({max_x} x {max_y} x {max_z} mm), even with rotation."
                ),
                evidence=evidence,
                suggested_action=(
                    "Split the model into modular interlocking components or select a larger "
                    "industrial machine format (e.g. large-format gantry mill or industrial SLS)."
                ),
            )

    @staticmethod
    def _check_aspect_ratio(dim_x: float, dim_y: float, dim_z: float, limits: Dict[str, Any]) -> DFMFindingSchema:
        dims = [dim_x, dim_y, dim_z]
        max_d = max(dims)
        min_d = max(min(dims), 0.001)
        ratio = round(max_d / min_d, 2)
        threshold = limits.get("max_aspect_ratio", 15.0)

        evidence = {"aspect_ratio": ratio, "max_recommended_ratio": threshold}

        if ratio <= threshold:
            return DFMFindingSchema(
                check_code="DFM_ASPECT_RATIO_OK",
                check_name="Geometric Aspect Ratio Stability",
                category="manufacturing_limit",
                severity="info",
                passed=True,
                explanation="Model aspect ratio is within standard rigidity and thermal stability limits.",
                evidence=evidence,
                suggested_action="Standard fixturing and support parameters are adequate.",
            )
        else:
            return DFMFindingSchema(
                check_code="DFM_HIGH_ASPECT_RATIO",
                check_name="High Slenderness / Aspect Ratio Alert",
                category="manufacturing_limit",
                severity="warning",
                passed=False,
                explanation=(
                    f"Part aspect ratio ({ratio}:1) exceeds typical guideline ({threshold}:1). "
                    "Slender geometries are prone to chatter/deflection under CNC cutting forces "
                    "or thermal warpage/bed detachment during 3D printing."
                ),
                evidence=evidence,
                suggested_action=(
                    "Add stiffening ribs, gussets, or increase cross-sectional thickness. "
                    "For CNC parts, plan multi-setup stabilizing vices or sacrificial tabs."
                ),
            )

    @staticmethod
    def _check_mesh_resolution(triangle_count: int, dim_x: float, dim_y: float, dim_z: float) -> DFMFindingSchema:
        evidence = {"triangle_count": triangle_count}
        max_dim = max(dim_x, dim_y, dim_z)

        if triangle_count < 100 and max_dim > 10.0:
            return DFMFindingSchema(
                check_code="DFM_LOW_FACET_RESOLUTION",
                check_name="Low Polygonal Facet Resolution",
                category="heuristic",
                severity="warning",
                passed=False,
                explanation=(
                    f"Mesh has only {triangle_count} triangular facets for a {max_dim} mm part. "
                    "Curved surfaces will appear noticeably faceted and polygonal rather than smooth."
                ),
                evidence=evidence,
                suggested_action="Re-export from CAD with a finer chordal tolerance / angle deviation setting.",
            )
        elif triangle_count > 1_500_000:
            return DFMFindingSchema(
                check_code="DFM_EXCESSIVE_TRIANGLES",
                check_name="Excessive Triangle Density",
                category="heuristic",
                severity="warning",
                passed=False,
                explanation=(
                    f"Mesh contains {triangle_count:,} triangles. While detail is preserved, "
                    "extremely dense meshes significantly slow CAM toolpath calculation and slicers."
                ),
                evidence=evidence,
                suggested_action="Decimate the mesh using quadric decimation to target 200,000–500,000 triangles without loss of tolerance.",
            )
        else:
            return DFMFindingSchema(
                check_code="DFM_FACET_RESOLUTION_OK",
                check_name="Polygonal Resolution Suitable",
                category="heuristic",
                severity="info",
                passed=True,
                explanation="Polygonal facet density is well-balanced for CAM processing and surface fidelity.",
                evidence=evidence,
                suggested_action="No decimation or re-export required.",
            )

    @staticmethod
    def _check_minimum_thickness_heuristic(
        dim_x: float, dim_y: float, dim_z: float, limits: Dict[str, Any]
    ) -> DFMFindingSchema:
        min_dim = min(dim_x, dim_y, dim_z)
        rec_min = limits.get("min_recommended_thickness_mm", 1.0)
        evidence = {"smallest_envelope_dimension_mm": min_dim, "recommended_minimum_mm": rec_min}

        if min_dim < rec_min:
            return DFMFindingSchema(
                check_code="DFM_POTENTIAL_THIN_WALL",
                check_name="Potential Sub-Millimeter Thin Section (Heuristic)",
                category="heuristic",
                severity="warning",
                passed=False,
                explanation=(
                    f"Smallest overall bounding box dimension is {min_dim} mm, below the recommended "
                    f"{rec_min} mm threshold. Note: This is an upper-bound heuristic based on bounding box; "
                    "true local wall thickness requires ray-cast voxel distance fields on CAD solid geometry."
                ),
                evidence=evidence,
                suggested_action="Verify wall thickness on CAD cross-sections before release to manufacturing.",
            )
        else:
            return DFMFindingSchema(
                check_code="DFM_THICKNESS_HEURISTIC_OK",
                check_name="Envelope Minimum Thickness Feasible",
                category="heuristic",
                severity="info",
                passed=True,
                explanation="Smallest bounding dimension exceeds minimum process guidelines.",
                evidence=evidence,
                suggested_action="Confirm localized internal wall thickness in CAD model.",
            )

    @staticmethod
    def _check_unsupported_capabilities(process: str) -> DFMFindingSchema:
        return DFMFindingSchema(
            check_code="DFM_UNSUPPORTED_STL_CHECKS_DISCLAIMER",
            check_name="Discrete Mesh Analysis Boundaries",
            category="machinability",
            severity="info",
            passed=True,
            explanation=(
                "Discrete polygonal STL files lack B-Rep topology (analytic NURBS curves, cylinders, planes). "
                "Therefore, internal undercut detection, 3-axis cutter tool access reachability, "
                "draft angle taper for molding, and blind threaded holes cannot be deterministically verified "
                "from this STL alone and require STEP/IGES model review."
            ),
            evidence={"file_format": "STL", "target_process": process},
            suggested_action="Supply STEP AP242 models for automated toolpath undercut and CNC feature recognition.",
        )
