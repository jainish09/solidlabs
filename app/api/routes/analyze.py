"""CAD STL Upload and DFM Analysis API Routes."""

import datetime
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, File, UploadFile, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.config import settings
from app.db.session import get_db
from app.models.analysis import CADAnalysis
from app.schemas.analysis import (
    CADAnalysisResponse,
    GeometryProperties,
    BoundingBox,
    DFMFindingSchema,
)
from app.services.cad_processor import CADProcessor, CADProcessingError
from app.services.dfm_engine import DFMEngine
from app.services.ai_service import ai_service

router = APIRouter()


@router.post(
    "/analyze",
    response_model=CADAnalysisResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload & Analyze CAD STL File",
    description=(
        "Accepts multipart/form-data STL uploads. Verifies headers, computes exact geometry "
        "(bounding box, surface area, volume if manifold), runs rule-based DFM checks, "
        "and optionally synthesizes an AI engineering explanation."
    ),
)
async def upload_and_analyze_cad(
    file: UploadFile = File(..., description="Binary or ASCII STL file"),
    process: str = Query(
        "3d_printing_fdm",
        description="Target manufacturing process for DFM limits (3d_printing_fdm, 3d_printing_sla, 3d_printing_sls, cnc_machining_3axis)",
    ),
    units: str = Query(
        "mm",
        description="Explicit dimensional unit assumption for unitless STL coordinates",
    ),
    explain_with_ai: bool = Query(
        False,
        description="Whether to generate an engineering explanation using AI (falls back deterministically if no key)",
    ),
    db: Session = Depends(get_db),
) -> CADAnalysisResponse:
    # Validate extension
    filename = file.filename or "uploaded_model.stl"
    if not filename.lower().endswith(".stl"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format for '{filename}'. Only .stl files are supported.",
        )

    # Read file content safely in memory or buffer
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded stream: {str(e)}",
        )

    # Enforce file size limit
    if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
        max_mb = settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed upload size limit of {max_mb} MB.",
        )

    # Process geometry
    try:
        processed = CADProcessor.process_stl_file(
            file_bytes=content,
            original_filename=filename,
            units_assumption=units,
        )
    except CADProcessingError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal geometry computation error: {str(e)}",
        )

    # Run DFM Engine
    dfm_findings_objects = DFMEngine.evaluate(
        geometry=processed["geometry"],
        process=process,
    )
    dfm_findings_dicts = [f.model_dump() for f in dfm_findings_objects]

    # Generate AI / deterministic explanation if requested
    ai_explanation: Optional[str] = None
    if explain_with_ai:
        ai_explanation = ai_service.generate_explanation(
            filename=processed["filename"],
            units=processed["units"],
            geometry=processed["geometry"],
            dfm_findings=dfm_findings_dicts,
        )

    # Persist in Database
    analysis_id = f"anl_{uuid.uuid4().hex[:14]}"
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    geom = processed["geometry"]
    bb = geom["bounding_box"]

    db_record = CADAnalysis(
        id=analysis_id,
        filename=processed["filename"],
        file_hash=processed["file_hash"],
        file_size_bytes=processed["file_size_bytes"],
        units=processed["units"],
        dimension_x=bb["x"],
        dimension_y=bb["y"],
        dimension_z=bb["z"],
        surface_area_mm2=geom["surface_area_mm2"],
        volume_mm3=geom["volume_mm3"],
        is_watertight=geom["is_watertight"],
        is_volume_valid=geom["is_volume_valid"],
        triangle_count=geom["triangle_count"],
        warnings=processed["warnings"],
        dfm_findings=dfm_findings_dicts,
        ai_explanation=ai_explanation,
        created_at=now_utc,
    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return CADAnalysisResponse(
        analysis_id=db_record.id,
        filename=db_record.filename,
        file_size_bytes=db_record.file_size_bytes,
        file_hash=db_record.file_hash,
        units=db_record.units,
        geometry=GeometryProperties(
            bounding_box=BoundingBox(
                x=db_record.dimension_x,
                y=db_record.dimension_y,
                z=db_record.dimension_z,
            ),
            surface_area_mm2=db_record.surface_area_mm2,
            volume_mm3=db_record.volume_mm3,
            triangle_count=db_record.triangle_count,
            is_watertight=db_record.is_watertight,
            is_volume_valid=db_record.is_volume_valid,
        ),
        warnings=db_record.warnings,
        dfm_findings=[DFMFindingSchema(**f) for f in db_record.dfm_findings],
        ai_explanation=db_record.ai_explanation,
        created_at=db_record.created_at,
    )


@router.get(
    "/analyze/{analysis_id}",
    response_model=CADAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve Stored CAD Analysis",
    description="Fetch previously computed CAD geometry metrics and DFM findings by analysis ID.",
)
def get_analysis_by_id(
    analysis_id: str,
    db: Session = Depends(get_db),
) -> CADAnalysisResponse:
    record = db.scalar(select(CADAnalysis).where(CADAnalysis.id == analysis_id))
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CAD analysis '{analysis_id}' not found.",
        )

    return CADAnalysisResponse(
        analysis_id=record.id,
        filename=record.filename,
        file_size_bytes=record.file_size_bytes,
        file_hash=record.file_hash,
        units=record.units,
        geometry=GeometryProperties(
            bounding_box=BoundingBox(
                x=record.dimension_x,
                y=record.dimension_y,
                z=record.dimension_z,
            ),
            surface_area_mm2=record.surface_area_mm2,
            volume_mm3=record.volume_mm3,
            triangle_count=record.triangle_count,
            is_watertight=record.is_watertight,
            is_volume_valid=record.is_volume_valid,
        ),
        warnings=record.warnings,
        dfm_findings=[DFMFindingSchema(**f) for f in record.dfm_findings],
        ai_explanation=record.ai_explanation,
        created_at=record.created_at,
    )
