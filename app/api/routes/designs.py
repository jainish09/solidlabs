"""API routes for CAD Ingestion, Parametric Generation, Revisions, Improvements, and Export."""

from typing import Optional, List
from fastapi import APIRouter, Depends, File, UploadFile, Query, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_current_user
from app.db.session import get_db
from app.schemas.cad_asset import CADAssetResponse, DesignRevisionResponse, CADUploadResponse
from app.schemas.design_generation import (
    DesignGenerateRequest,
    DesignGenerateResponse,
    DesignTransformRequest,
    DesignTransformResponse,
)
from app.schemas.improvement import ImprovementRequestPayload, ImprovementPlanResponse
from app.services.cad_processor import CADProcessingError
from app.services.cad_kernel import CADKernelError, UnsupportedCADKernelError
from app.services.design_service import (
    DesignService,
    DesignServiceError,
    DesignNotFoundError,
)

router = APIRouter()


@router.post(
    "/designs/upload",
    response_model=CADUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload & Register CAD Design Asset",
    description="Ingests STL geometry, validates mesh topology, persists metadata and initial revision v1.",
)
async def upload_cad_asset(
    file: UploadFile = File(..., description="STL mesh CAD file"),
    units: str = Query("mm", description="Dimensional units assumption (default mm)"),
    process: str = Query("3d_printing_fdm", description="Target manufacturing process for DFM limits"),
    description: Optional[str] = Query(None, description="Optional design notes"),
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CADUploadResponse:
    filename = file.filename or "uploaded_design.stl"

    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read file stream: {str(e)}",
        )

    if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
        max_mb = settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum upload limit of {max_mb} MB.",
        )

    try:
        response = DesignService.register_uploaded_file(
            db=db,
            file_bytes=content,
            original_filename=filename,
            owner_id=current_user,
            units=units,
            process=process,
            description=description,
        )
        return response
    except UnsupportedCADKernelError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))
    except (CADProcessingError, DesignServiceError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/designs/generate",
    response_model=DesignGenerateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate Parametric 3D CAD from Text Description",
    description=(
        "Converts natural language engineering intent into validated parameters, "
        "synthesizes a real 100% watertight solid model, computes geometric properties, "
        "and registers the resulting CAD design."
    ),
)
def generate_parametric_design(
    request: DesignGenerateRequest,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DesignGenerateResponse:
    try:
        response = DesignService.generate_parametric_design(
            db=db,
            request=request,
            owner_id=current_user,
        )
        return response
    except CADKernelError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/designs/{design_id}/improvement-requests",
    response_model=ImprovementPlanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Request AI-Assisted CAD Design Improvements",
    description=(
        "Analyzes real geometry and DFM results against user requirements to formulate "
        "an engineering revision plan. Optionally applies safe, parameterized operations "
        "and creates a new immutable revision."
    ),
)
def create_improvement_request(
    design_id: str,
    payload: ImprovementRequestPayload,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ImprovementPlanResponse:
    try:
        response = DesignService.request_design_improvement(
            db=db,
            design_id=design_id,
            payload=payload,
            owner_id=current_user,
        )
        return response
    except DesignNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DesignServiceError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/designs/{design_id}/transform",
    response_model=DesignTransformResponse,
    status_code=status.HTTP_200_OK,
    summary="Transform CAD Geometry from Natural Language Request",
    description=(
        "Translates user modification request into validated geometric operations, "
        "executes real 3D solid modeling, creates immutable revision, "
        "and returns dual-model comparison metrics with verified export links."
    ),
)
def transform_design_geometry(
    design_id: str,
    payload: DesignTransformRequest,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DesignTransformResponse:
    try:
        return DesignService.transform_design(
            db=db,
            design_id=design_id,
            request=payload,
            owner_id=current_user,
        )
    except DesignNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DesignServiceError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/designs",
    response_model=List[CADAssetResponse],
    status_code=status.HTTP_200_OK,
    summary="List Registered CAD Design Assets",
    description="Retrieve a paginated list of registered CAD design assets.",
)
def list_cad_designs(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of items to return"),
    db: Session = Depends(get_db),
) -> List[CADAssetResponse]:
    return DesignService.list_designs(db, skip=skip, limit=limit)


@router.get(

    "/designs/{design_id}",
    response_model=CADAssetResponse,
    status_code=status.HTTP_200_OK,
    summary="Get CAD Design Asset Metadata",
    description="Retrieve registered CAD design asset information and active geometry.",
)
def get_design_by_id(
    design_id: str,
    db: Session = Depends(get_db),
) -> CADAssetResponse:
    try:
        return DesignService.get_design_asset(db, design_id)
    except DesignNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/designs/{design_id}/revisions",
    response_model=List[DesignRevisionResponse],
    status_code=status.HTTP_200_OK,
    summary="List Design Revisions",
    description="Retrieve chronological history of immutable design revisions and operations.",
)
def list_design_revisions(
    design_id: str,
    db: Session = Depends(get_db),
) -> List[DesignRevisionResponse]:
    try:
        return DesignService.list_revisions(db, design_id)
    except DesignNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/designs/{design_id}/export",
    summary="Export CAD Geometry (STL or STEP)",
    description="Securely download geometry in the requested format with path-traversal prevention.",
)
def export_design_model(
    design_id: str,
    format: str = Query("stl", description="Export format ('stl' or 'step')"),
    revision_id: Optional[str] = Query(None, description="Optional specific historical revision ID"),
    db: Session = Depends(get_db),
):
    try:
        file_path, media_type, download_name = DesignService.get_export_file_path(
            db=db,
            design_id=design_id,
            export_format=format,
            revision_id=revision_id,
        )
        return FileResponse(
            path=file_path,
            media_type=media_type,
            filename=download_name,
        )
    except DesignNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except UnsupportedCADKernelError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))
    except DesignServiceError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
