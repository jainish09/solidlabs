"""CAD Processing Service using Trimesh and NumPy for STL geometry extraction.

Responsibilities:
- Safe temporary file persistence and cleanup
- Deep format and header validation (ASCII vs Binary STL)
- Mesh topology and manifold inspection
- Physical dimension calculation (bounding box, surface area, volume)
- Strict mathematical integrity guarantees (e.g. watertightness required for solid volume)
"""

import os
import uuid
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import trimesh
from app.core.config import settings
from app.core.security import calculate_sha256, sanitize_filename, validate_stl_header


class CADProcessingError(Exception):
    """Domain exception raised when CAD processing or validation fails."""
    pass


class CADProcessor:
    """Service to safely parse, validate, and compute geometry for 3D STL models."""

    @staticmethod
    def process_stl_file(
        file_bytes: bytes,
        original_filename: str,
        units_assumption: str = "mm"
    ) -> Dict[str, Any]:
        """Validate and parse an STL file from bytes into verified geometry metrics.

        Args:
            file_bytes: Raw binary upload content
            original_filename: Original client filename
            units_assumption: Assumed measurement unit for unitless STL coordinates

        Returns:
            Dict containing geometry metrics, warnings, and file metadata
        """
        file_size = len(file_bytes)
        if file_size == 0:
            raise CADProcessingError("Uploaded STL file is empty (0 bytes).")

        if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
            max_mb = settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)
            raise CADProcessingError(f"Uploaded file exceeds maximum allowed size of {max_mb} MB.")

        # Validate header bytes
        is_stl, stl_format = validate_stl_header(file_bytes[:100])
        if not is_stl:
            raise CADProcessingError(
                "Uploaded file does not match binary or ASCII STL format signatures."
            )

        clean_filename = sanitize_filename(original_filename)
        temp_id = uuid.uuid4().hex
        temp_path = os.path.join(settings.UPLOAD_TEMP_DIR, f"{temp_id}_{clean_filename}")

        try:
            # Write safely to temporary storage for trimesh analysis
            with open(temp_path, "wb") as f:
                f.write(file_bytes)

            file_hash = calculate_sha256(temp_path)

            # Load mesh with trimesh
            try:
                loaded = trimesh.load(temp_path, file_type="stl", force="mesh")
            except Exception as e:
                raise CADProcessingError(f"Failed to parse STL geometry: {str(e)}")

            # Extract mesh object
            if isinstance(loaded, trimesh.Scene):
                if len(loaded.geometry) == 0:
                    raise CADProcessingError("STL file contains an empty 3D scene with no meshes.")
                mesh = trimesh.util.concatenate(list(loaded.geometry.values()))
            elif isinstance(loaded, trimesh.Trimesh):
                mesh = loaded
            else:
                raise CADProcessingError("Parsed geometry is not a recognized polygon mesh.")

            # Validate basic mesh characteristics
            if mesh.vertices is None or len(mesh.vertices) == 0 or len(mesh.faces) == 0:
                raise CADProcessingError("Mesh contains zero vertices or triangular faces.")

            warnings: List[str] = []

            # STL files have unitless coordinates: make explicit
            units = units_assumption or settings.DEFAULT_STL_UNITS

            # Bounding box dimensions
            extents = mesh.bounding_box.extents.tolist()
            dim_x = round(float(extents[0]), 3)
            dim_y = round(float(extents[1]), 3)
            dim_z = round(float(extents[2]), 3)

            # Heuristic scale checks
            max_dim = max(dim_x, dim_y, dim_z)
            min_dim = min(dim_x, dim_y, dim_z)

            if max_dim < 1.0:
                warnings.append(
                    f"Maximum dimension is {max_dim} {units}. Model appears unusually miniature. "
                    "Confirm coordinates are not in meters or inches."
                )
            elif max_dim > 2000.0:
                warnings.append(
                    f"Maximum dimension is {max_dim} {units}. Model appears unusually huge. "
                    "Confirm coordinates are not in micrometers or nanometers."
                )

            # Surface Area
            try:
                surface_area: Optional[float] = round(float(mesh.area), 2)
            except Exception:
                surface_area = None
                warnings.append("Could not calculate surface area due to mesh degeneracies.")

            # Watertightness and Volume verification
            is_watertight = bool(mesh.is_watertight)
            volume: Optional[float] = None
            is_volume_valid = False

            if is_watertight:
                try:
                    computed_vol = float(mesh.volume)
                    # A closed mesh with correct face winding will yield positive volume
                    if computed_vol > 0:
                        volume = round(computed_vol, 2)
                        is_volume_valid = True
                    else:
                        # Sometimes face normals are flipped inwards
                        mesh.fix_normals()
                        computed_vol = float(mesh.volume)
                        if computed_vol > 0:
                            volume = round(computed_vol, 2)
                            is_volume_valid = True
                        else:
                            warnings.append(
                                "Watertight mesh has inverted or self-intersecting normals; volume calculation may be inverted."
                            )
                            volume = round(abs(computed_vol), 2)
                            is_volume_valid = True
                except Exception:
                    warnings.append("Failed to evaluate volume despite manifold topology.")
            else:
                warnings.append(
                    "Mesh is non-watertight (contains open boundaries, hole borders, or non-manifold edges). "
                    "Mathematically sound solid volume cannot be guaranteed."
                )

            triangle_count = int(len(mesh.faces))

            return {
                "filename": clean_filename,
                "file_hash": file_hash,
                "file_size_bytes": file_size,
                "units": units,
                "geometry": {
                    "bounding_box": {
                        "x": dim_x,
                        "y": dim_y,
                        "z": dim_z,
                    },
                    "surface_area_mm2": surface_area,
                    "volume_mm3": volume,
                    "triangle_count": triangle_count,
                    "is_watertight": is_watertight,
                    "is_volume_valid": is_volume_valid,
                },
                "warnings": warnings,
            }

        finally:
            # Safe temporary file cleanup: do not retain temporary files unless configured
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except OSError:
                    pass
