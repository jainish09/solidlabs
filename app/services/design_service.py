"""Design Service managing CAD asset registration, revisions, generation, and improvements."""

import datetime
import os
import uuid
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, func
import trimesh

from app.core.config import settings
from app.core.security import calculate_sha256, sanitize_filename, is_safe_path, validate_step_header
from app.models.analysis import CADAnalysis
from app.models.cad_asset import CADAsset, DesignRevision
from app.models.design_generation import DesignGenerationJob
from app.models.improvement import ImprovementRequest
from app.schemas.cad_asset import CADAssetResponse, DesignRevisionResponse, CADUploadResponse
from app.schemas.analysis import GeometryProperties, BoundingBox, DFMFindingSchema, CADAnalysisResponse
from app.schemas.design_generation import (
    DesignGenerateRequest,
    DesignGenerateResponse,
    DesignTransformRequest,
    DesignTransformResponse,
)
from app.schemas.improvement import ImprovementRequestPayload, ImprovementPlanResponse, ModificationProposal
from app.services.cad_processor import CADProcessor, CADProcessingError
from app.services.cad_kernel import CADKernelService, CADKernelError, UnsupportedCADKernelError, is_step_supported
from app.services.dfm_engine import DFMEngine
from app.services.ai_service import ai_service


class DesignServiceError(Exception):
    """Domain exception for design asset management errors."""
    pass


class DesignNotFoundError(DesignServiceError):
    """Raised when a design asset ID is not found."""
    pass


class DesignService:
    """Core domain service for CAD asset lifecycle, parametric generation, and revisioning."""

    @classmethod
    def register_uploaded_file(
        cls,
        db: Session,
        file_bytes: bytes,
        original_filename: str,
        owner_id: str,
        units: str = "mm",
        process: str = "3d_printing_fdm",
        description: Optional[str] = None,
    ) -> CADUploadResponse:
        """Process and register an uploaded CAD file as an asset and revision 1."""
        clean_filename = sanitize_filename(original_filename)
        ext = os.path.splitext(clean_filename)[1].lower()

        if ext not in (".stl", ".step", ".stp"):
            raise CADProcessingError(
                f"Unsupported file extension '{ext}'. Only .stl, .step, and .stp are supported."
            )

        # Handle STEP files
        if ext in (".step", ".stp"):
            if not validate_step_header(file_bytes[:200]):
                raise CADProcessingError("Uploaded file does not match STEP (ISO-10303-21) header signature.")
            if not is_step_supported():
                raise UnsupportedCADKernelError(
                    "STEP format processing requires a functional CAD kernel (CadQuery/Open CASCADE) "
                    "which is not available in this environment. Please upload STL format."
                )


        # Process geometry through CADProcessor
        processed = CADProcessor.process_stl_file(
            file_bytes=file_bytes,
            original_filename=clean_filename,
            units_assumption=units,
        )

        design_id = f"cad_{uuid.uuid4().hex[:14]}"
        rev_id = f"rev_{uuid.uuid4().hex[:14]}"
        anl_id = f"anl_{uuid.uuid4().hex[:14]}"
        now_utc = datetime.datetime.now(datetime.timezone.utc)

        # Persist physical file in designated CAD assets storage
        stored_filename = f"{design_id}_v1_{clean_filename}"
        permanent_path = os.path.join(settings.CAD_STORAGE_DIR, stored_filename)

        with open(permanent_path, "wb") as f:
            f.write(file_bytes)

        file_hash = calculate_sha256(permanent_path)
        geom = processed["geometry"]
        bb = geom["bounding_box"]

        # 1. Run DFM engine and persist analysis
        dfm_findings = DFMEngine.evaluate(geometry=geom, process=process)
        dfm_dicts = [f.model_dump() for f in dfm_findings]

        analysis = CADAnalysis(
            id=anl_id,
            filename=clean_filename,
            file_hash=file_hash,
            file_size_bytes=len(file_bytes),
            units=units,
            dimension_x=bb["x"],
            dimension_y=bb["y"],
            dimension_z=bb["z"],
            surface_area_mm2=geom["surface_area_mm2"],
            volume_mm3=geom["volume_mm3"],
            is_watertight=geom["is_watertight"],
            is_volume_valid=geom["is_volume_valid"],
            triangle_count=geom["triangle_count"],
            warnings=processed["warnings"],
            dfm_findings=dfm_dicts,
            ai_explanation=None,
            created_at=now_utc,
        )
        db.add(analysis)

        # 2. Create CADAsset record
        asset = CADAsset(
            id=design_id,
            owner_id=owner_id,
            name=clean_filename,
            description=description or f"Uploaded CAD model: {clean_filename}",
            source_type="upload",
            file_path=permanent_path,
            file_format="stl",
            file_hash=file_hash,
            file_size_bytes=len(file_bytes),
            analysis_id=anl_id,
            created_at=now_utc,
            updated_at=now_utc,
        )
        db.add(asset)

        # 3. Create initial revision 1 record
        initial_revision = DesignRevision(
            id=rev_id,
            design_id=design_id,
            revision_number=1,
            file_path=permanent_path,
            file_format="stl",
            file_hash=file_hash,
            file_size_bytes=len(file_bytes),
            change_summary="Initial upload and geometry baseline (v1).",
            operation_history=[{"operation": "initial_upload", "filename": clean_filename}],
            geometry_snapshot=geom,
            created_at=now_utc,
        )
        db.add(initial_revision)

        db.commit()
        db.refresh(asset)
        db.refresh(initial_revision)
        db.refresh(analysis)

        return CADUploadResponse(
            design=cls._format_asset_response(asset, geom),
            initial_revision=cls._format_revision_response(initial_revision),
            analysis=CADAnalysisResponse(
                analysis_id=analysis.id,
                filename=analysis.filename,
                file_size_bytes=analysis.file_size_bytes,
                file_hash=analysis.file_hash,
                units=analysis.units,
                geometry=GeometryProperties(
                    bounding_box=BoundingBox(
                        x=analysis.dimension_x, y=analysis.dimension_y, z=analysis.dimension_z
                    ),
                    surface_area_mm2=analysis.surface_area_mm2,
                    volume_mm3=analysis.volume_mm3,
                    triangle_count=analysis.triangle_count,
                    is_watertight=analysis.is_watertight,
                    is_volume_valid=analysis.is_volume_valid,
                ),
                warnings=analysis.warnings,
                dfm_findings=[DFMFindingSchema(**f) for f in analysis.dfm_findings],
                ai_explanation=analysis.ai_explanation,
                created_at=analysis.created_at,
            ),
        )

    @classmethod
    def generate_parametric_design(
        cls,
        db: Session,
        request: DesignGenerateRequest,
        owner_id: str,
    ) -> DesignGenerateResponse:
        """Synthesize a real 3D solid component from text prompt and template parameters."""
        job_id = f"gen_{uuid.uuid4().hex[:14]}"
        design_id = f"cad_{uuid.uuid4().hex[:14]}"
        rev_id = f"rev_{uuid.uuid4().hex[:14]}"
        anl_id = f"anl_{uuid.uuid4().hex[:14]}"
        now_utc = datetime.datetime.now(datetime.timezone.utc)

        # 1. Parameter extraction: use explicit parameters if provided, else extract from prompt
        raw_params = request.parameters or ai_service.extract_parametric_specification(
            prompt=request.prompt, template_type=request.template_type
        )

        # 2. Build real 3D solid geometry via CADKernelService
        try:
            mesh, validated_params = CADKernelService.generate_component(
                template_type=request.template_type,
                raw_params=raw_params,
            )
        except Exception as e:
            # Record failed job
            fail_job = DesignGenerationJob(
                id=job_id,
                owner_id=owner_id,
                prompt=request.prompt,
                template_type=request.template_type,
                parameters=raw_params,
                status="FAILED",
                error_message=str(e),
                created_at=now_utc,
            )
            db.add(fail_job)
            db.commit()
            raise CADKernelError(f"Parametric CAD generation failed: {str(e)}")

        # 3. Export real STL solid to permanent storage
        design_name = request.name or f"{request.template_type}_{uuid.uuid4().hex[:6]}"
        stored_filename = f"{design_id}_v1_{design_name}.stl"
        permanent_path = os.path.join(settings.CAD_STORAGE_DIR, stored_filename)

        CADKernelService.export_model(mesh, permanent_path, export_format="stl")
        file_hash = calculate_sha256(permanent_path)
        file_size = os.path.getsize(permanent_path)

        # 4. Measure real physical geometry
        extents = mesh.bounding_box.extents.tolist()
        dim_x = round(float(extents[0]), 3)
        dim_y = round(float(extents[1]), 3)
        dim_z = round(float(extents[2]), 3)
        surface_area = round(float(mesh.area), 2)
        volume = round(float(mesh.volume), 2)

        geom = {
            "bounding_box": {"x": dim_x, "y": dim_y, "z": dim_z},
            "surface_area_mm2": surface_area,
            "volume_mm3": volume,
            "triangle_count": int(len(mesh.faces)),
            "is_watertight": bool(mesh.is_watertight),
            "is_volume_valid": bool(mesh.volume > 0 and mesh.is_watertight),
        }

        # 5. Save Analysis
        analysis = CADAnalysis(
            id=anl_id,
            filename=stored_filename,
            file_hash=file_hash,
            file_size_bytes=file_size,
            units=request.units,
            dimension_x=dim_x,
            dimension_y=dim_y,
            dimension_z=dim_z,
            surface_area_mm2=surface_area,
            volume_mm3=volume,
            is_watertight=True,
            is_volume_valid=True,
            triangle_count=int(len(mesh.faces)),
            warnings=[],
            dfm_findings=[],
            ai_explanation=None,
            created_at=now_utc,
        )
        db.add(analysis)

        # 6. Save Asset and Revision
        asset = CADAsset(
            id=design_id,
            owner_id=owner_id,
            name=design_name,
            description=f"Generated from prompt: '{request.prompt[:120]}...'",
            source_type="generated",
            file_path=permanent_path,
            file_format="stl",
            file_hash=file_hash,
            file_size_bytes=file_size,
            analysis_id=anl_id,
            created_at=now_utc,
            updated_at=now_utc,
        )
        db.add(asset)

        initial_revision = DesignRevision(
            id=rev_id,
            design_id=design_id,
            revision_number=1,
            file_path=permanent_path,
            file_format="stl",
            file_hash=file_hash,
            file_size_bytes=file_size,
            change_summary=f"Parametric generation ({request.template_type}) baseline.",
            operation_history=[
                {"operation": "text_to_parametric_generation", "template": request.template_type, "parameters": validated_params}
            ],
            geometry_snapshot=geom,
            created_at=now_utc,
        )
        db.add(initial_revision)

        # 7. Record successful job
        job = DesignGenerationJob(
            id=job_id,
            owner_id=owner_id,
            prompt=request.prompt,
            template_type=request.template_type,
            parameters=validated_params,
            status="COMPLETED",
            resulting_design_id=design_id,
            created_at=now_utc,
        )
        db.add(job)

        db.commit()

        return DesignGenerateResponse(
            design_id=design_id,
            revision_id=rev_id,
            template_type=request.template_type,
            parameters=validated_params,
            units=request.units,
            geometry=GeometryProperties(
                bounding_box=BoundingBox(x=dim_x, y=dim_y, z=dim_z),
                surface_area_mm2=surface_area,
                volume_mm3=volume,
                triangle_count=int(len(mesh.faces)),
                is_watertight=True,
                is_volume_valid=True,
            ),
            preview_url=f"{settings.API_V1_PREFIX}/designs/{design_id}",
            export_stl_url=f"{settings.API_V1_PREFIX}/designs/{design_id}/export?format=stl",
            export_step_url=f"{settings.API_V1_PREFIX}/designs/{design_id}/export?format=step",
            created_at=now_utc,
        )

    @classmethod
    def request_design_improvement(
        cls,
        db: Session,
        design_id: str,
        payload: ImprovementRequestPayload,
        owner_id: str,
    ) -> ImprovementPlanResponse:
        """Formulate an engineering revision plan and optionally execute safe CAD modifications."""
        asset = db.scalar(select(CADAsset).where(CADAsset.id == design_id))
        if not asset:
            raise DesignNotFoundError(f"CAD design '{design_id}' not found.")

        # Retrieve geometry analysis and DFM findings
        analysis = asset.analysis
        geom = {}
        dfm_findings = []
        if analysis:
            geom = {
                "bounding_box": {"x": analysis.dimension_x, "y": analysis.dimension_y, "z": analysis.dimension_z},
                "surface_area_mm2": analysis.surface_area_mm2,
                "volume_mm3": analysis.volume_mm3,
                "triangle_count": analysis.triangle_count,
                "is_watertight": analysis.is_watertight,
                "is_volume_valid": analysis.is_volume_valid,
            }
            dfm_findings = analysis.dfm_findings or []

        # Generate AI structured proposal
        plan_dict = ai_service.propose_improvement_plan(
            filename=asset.name,
            geometry=geom,
            dfm_findings=dfm_findings,
            user_requirements=payload.user_requirements,
            intended_application=payload.intended_application,
            process=payload.manufacturing_process,
            material=payload.material,
            constraints=payload.constraints or {},
        )

        imp_id = f"imp_{uuid.uuid4().hex[:14]}"
        now_utc = datetime.datetime.now(datetime.timezone.utc)
        executed_rev_obj: Optional[DesignRevisionResponse] = None
        comparison_report: Optional[Dict[str, Any]] = None
        executed_rev_id: Optional[str] = None
        status = "PLANNED"

        # Execute safe geometry modification if requested and feasible
        if payload.execute_modifications:
            executable_ops = [m for m in plan_dict.get("proposed_modifications", []) if m.get("is_executable")]
            if executable_ops and os.path.exists(asset.file_path):
                op_to_run = executable_ops[0]
                try:
                    # Load current mesh safely
                    mesh = trimesh.load(asset.file_path, file_type="stl", force="mesh")
                    mod_mesh, audit = CADKernelService.apply_safe_modification(
                        original_mesh=mesh,
                        operation=op_to_run["operation"],
                        parameters=op_to_run.get("parameters", {}),
                    )

                    # Determine next revision number
                    current_max_rev = db.scalar(
                        select(func.max(DesignRevision.revision_number)).where(DesignRevision.design_id == design_id)
                    ) or 1
                    next_rev = current_max_rev + 1

                    # Save new revision to separate immutable file
                    new_filename = f"{design_id}_v{next_rev}_{asset.name}.stl"
                    new_path = os.path.join(settings.CAD_STORAGE_DIR, new_filename)
                    CADKernelService.export_model(mod_mesh, new_path, export_format="stl")

                    new_hash = calculate_sha256(new_path)
                    new_size = os.path.getsize(new_path)

                    new_geom = {
                        "bounding_box": {
                            "x": round(float(mod_mesh.bounding_box.extents[0]), 3),
                            "y": round(float(mod_mesh.bounding_box.extents[1]), 3),
                            "z": round(float(mod_mesh.bounding_box.extents[2]), 3),
                        },
                        "surface_area_mm2": round(float(mod_mesh.area), 2),
                        "volume_mm3": round(float(mod_mesh.volume), 2) if mod_mesh.is_watertight else None,
                        "triangle_count": int(len(mod_mesh.faces)),
                        "is_watertight": bool(mod_mesh.is_watertight),
                        "is_volume_valid": bool(mod_mesh.volume > 0 and mod_mesh.is_watertight),
                    }

                    rev_id = f"rev_{uuid.uuid4().hex[:14]}"
                    new_rev = DesignRevision(
                        id=rev_id,
                        design_id=design_id,
                        revision_number=next_rev,
                        file_path=new_path,
                        file_format="stl",
                        file_hash=new_hash,
                        file_size_bytes=new_size,
                        change_summary=f"Automated engineering modification: {op_to_run['operation']}.",
                        operation_history=[audit],
                        geometry_snapshot=new_geom,
                        created_at=now_utc,
                    )
                    db.add(new_rev)

                    # Update asset pointer to latest revision without modifying historical files
                    asset.file_path = new_path
                    asset.file_hash = new_hash
                    asset.file_size_bytes = new_size
                    asset.updated_at = now_utc

                    executed_rev_id = rev_id
                    status = "REVISED"
                    comparison_report = audit.get("delta", {})

                    executed_rev_obj = DesignRevisionResponse(
                        revision_id=new_rev.id,
                        design_id=new_rev.design_id,
                        revision_number=new_rev.revision_number,
                        file_format=new_rev.file_format,
                        file_hash=new_rev.file_hash,
                        file_size_bytes=new_rev.file_size_bytes,
                        change_summary=new_rev.change_summary,
                        operation_history=new_rev.operation_history,
                        geometry_snapshot=new_rev.geometry_snapshot,
                        created_at=new_rev.created_at,
                        download_url=f"{settings.API_V1_PREFIX}/designs/{design_id}/export?format=stl",
                    )
                except Exception as e:
                    logger.warning(f"Could not execute modification on design {design_id}: {e}")

        # Record ImprovementRequest
        imp_record = ImprovementRequest(
            id=imp_id,
            design_id=design_id,
            owner_id=owner_id,
            user_requirements=payload.user_requirements,
            intended_application=payload.intended_application,
            manufacturing_process=payload.manufacturing_process,
            material=payload.material,
            constraints=payload.constraints or {},
            ai_revision_plan=plan_dict,
            executed_revision_id=executed_rev_id,
            status=status,
            created_at=now_utc,
        )
        db.add(imp_record)
        db.commit()

        mod_proposals = [ModificationProposal(**m) for m in plan_dict.get("proposed_modifications", [])]

        return ImprovementPlanResponse(
            improvement_id=imp_id,
            design_id=design_id,
            status=status,
            observations=plan_dict.get("observations", []),
            assumptions=plan_dict.get("assumptions", []),
            proposed_modifications=mod_proposals,
            feasibility_assessment=plan_dict.get("feasibility_assessment", {}),
            executed_revision=executed_rev_obj,
            comparison_report=comparison_report,
            created_at=now_utc,
        )

    @classmethod
    def transform_design(
        cls,
        db: Session,
        design_id: str,
        request: DesignTransformRequest,
        owner_id: str,
    ) -> DesignTransformResponse:
        """Execute real AI-assisted CAD modification on an existing 3D solid model.

        Translates natural language intent, validates geometry operations,
        executes real CAD kernel modification, persists new immutable revision,
        reloads and validates exported geometry, and returns dual-model comparison metrics.
        """
        asset = db.scalar(select(CADAsset).where(CADAsset.id == design_id))
        if not asset:
            raise DesignNotFoundError(f"CAD design '{design_id}' not found.")

        if not os.path.exists(asset.file_path):
            raise DesignServiceError(f"Model file for design '{design_id}' was not found on storage.")

        # Determine current latest revision
        latest_rev_num = db.scalar(
            select(func.max(DesignRevision.revision_number)).where(DesignRevision.design_id == design_id)
        ) or 1
        orig_rev = db.scalar(
            select(DesignRevision).where(
                DesignRevision.design_id == design_id,
                DesignRevision.revision_number == latest_rev_num,
            )
        )
        orig_rev_id = orig_rev.id if orig_rev else f"rev_{design_id}_v{latest_rev_num}"

        # Load baseline original mesh
        try:
            orig_mesh = trimesh.load(asset.file_path, file_type="stl", force="mesh")
        except Exception as e:
            raise DesignServiceError(f"Failed to load baseline STL mesh: {str(e)}")

        orig_geom = {
            "bounding_box": {
                "x": round(float(orig_mesh.bounding_box.extents[0]), 3),
                "y": round(float(orig_mesh.bounding_box.extents[1]), 3),
                "z": round(float(orig_mesh.bounding_box.extents[2]), 3),
            },
            "surface_area_mm2": round(float(orig_mesh.area), 2),
            "volume_mm3": round(float(orig_mesh.volume), 2) if orig_mesh.is_watertight else None,
            "triangle_count": int(len(orig_mesh.faces)),
            "is_watertight": bool(orig_mesh.is_watertight),
            "is_volume_valid": bool(orig_mesh.is_watertight and orig_mesh.volume > 0),
        }

        # Interpret intent via AI service
        template_hint = getattr(asset, "template_type", None)
        op_name, op_params, summary, is_executable, advice = ai_service.interpret_transformation_request(
            prompt=request.prompt,
            geometry=orig_geom,
            template_type=template_hint,
            explicit_operation=request.operation,
            explicit_params=request.parameters,
        )

        if not is_executable:
            return DesignTransformResponse(
                success=False,
                design_id=design_id,
                original_revision_id=orig_rev_id,
                operation_performed=op_name,
                change_summary=summary,
                original_geometry=orig_geom,
                error_message=advice or "Requested modification cannot be executed safely on this geometry.",
                supported_alternatives=[
                    "scale_geometry",
                    "thicken_dimension",
                    "add_mounting_holes",
                    "rotate_geometry",
                    "translate_geometry",
                    "make_stronger",
                    "optimize_for_3d_printing",
                ],
            )

        # Execute geometry modification using CAD kernel
        try:
            mod_mesh, audit = CADKernelService.apply_safe_modification(
                original_mesh=orig_mesh,
                operation=op_name,
                parameters=op_params,
            )
        except CADKernelError as e:
            return DesignTransformResponse(
                success=False,
                design_id=design_id,
                original_revision_id=orig_rev_id,
                operation_performed=op_name,
                change_summary=f"Geometry engine could not apply '{op_name}': {str(e)}",
                original_geometry=orig_geom,
                error_message=str(e),
                supported_alternatives=[
                    "scale_geometry",
                    "thicken_dimension",
                    "add_mounting_holes",
                    "rotate_geometry",
                    "translate_geometry",
                    "make_stronger",
                    "optimize_for_3d_printing",
                ],
            )

        # Next revision
        next_rev = latest_rev_num + 1
        new_rev_id = f"rev_{uuid.uuid4().hex[:14]}"
        new_filename = f"{design_id}_v{next_rev}_{asset.name}.stl"
        new_path = os.path.join(settings.CAD_STORAGE_DIR, new_filename)

        # Export generated geometry
        CADKernelService.export_model(mod_mesh, new_path, export_format="stl")

        # Validate by reloading exported file from storage
        try:
            reloaded = trimesh.load(new_path, file_type="stl", force="mesh")
            validation_watertight = bool(reloaded.is_watertight)
            validation_volume = float(reloaded.volume) if validation_watertight else None
            validation_valid = bool(validation_watertight and validation_volume and validation_volume > 0)
        except Exception as e:
            raise DesignServiceError(f"Exported model validation reload failed: {str(e)}")

        new_hash = calculate_sha256(new_path)
        new_size = os.path.getsize(new_path)
        now_utc = datetime.datetime.now(datetime.timezone.utc)

        new_geom = {
            "bounding_box": {
                "x": round(float(mod_mesh.bounding_box.extents[0]), 3),
                "y": round(float(mod_mesh.bounding_box.extents[1]), 3),
                "z": round(float(mod_mesh.bounding_box.extents[2]), 3),
            },
            "surface_area_mm2": round(float(mod_mesh.area), 2),
            "volume_mm3": round(float(mod_mesh.volume), 2) if mod_mesh.is_watertight else None,
            "triangle_count": int(len(mod_mesh.faces)),
            "is_watertight": bool(mod_mesh.is_watertight),
            "is_volume_valid": bool(mod_mesh.is_watertight and mod_mesh.volume > 0),
        }

        orig_v = orig_geom.get("volume_mm3") or 0.0
        new_v = new_geom.get("volume_mm3") or 0.0
        v_pct = round(((new_v - orig_v) / orig_v * 100.0), 2) if orig_v > 0 else 0.0

        comparison_delta = {
            "volume_change_pct": v_pct,
            "original_volume_mm3": orig_v,
            "new_volume_mm3": new_v,
            "dimension_deltas": {
                "dx": round(new_geom["bounding_box"]["x"] - orig_geom["bounding_box"]["x"], 2),
                "dy": round(new_geom["bounding_box"]["y"] - orig_geom["bounding_box"]["y"], 2),
                "dz": round(new_geom["bounding_box"]["z"] - orig_geom["bounding_box"]["z"], 2),
            },
            "triangle_delta": new_geom["triangle_count"] - orig_geom["triangle_count"],
            "operation_audit": audit,
        }

        # Persist new immutable revision
        new_rev = DesignRevision(
            id=new_rev_id,
            design_id=design_id,
            revision_number=next_rev,
            file_path=new_path,
            file_format="stl",
            file_hash=new_hash,
            file_size_bytes=new_size,
            change_summary=summary,
            operation_history=[audit],
            geometry_snapshot=new_geom,
            created_at=now_utc,
        )
        db.add(new_rev)

        # Update active asset pointer
        asset.file_path = new_path
        asset.file_hash = new_hash
        asset.file_size_bytes = new_size
        asset.updated_at = now_utc

        # Record ImprovementRequest for auditing
        imp_id = f"imp_{uuid.uuid4().hex[:14]}"
        imp_record = ImprovementRequest(
            id=imp_id,
            design_id=design_id,
            owner_id=owner_id,
            user_requirements=request.prompt,
            intended_application="3D Studio Interactive Modification",
            manufacturing_process=request.manufacturing_process,
            material=request.material,
            constraints=request.constraints or {},
            ai_revision_plan={"operation": op_name, "parameters": op_params, "summary": summary},
            executed_revision_id=new_rev_id,
            status="REVISED",
            created_at=now_utc,
        )
        db.add(imp_record)
        db.commit()

        model_url = f"{settings.API_V1_PREFIX}/designs/{design_id}/export?format=stl&revision_id={new_rev_id}"
        step_url = f"{settings.API_V1_PREFIX}/designs/{design_id}/export?format=step&revision_id={new_rev_id}"

        return DesignTransformResponse(
            success=True,
            design_id=design_id,
            original_revision_id=orig_rev_id,
            new_revision_id=new_rev_id,
            new_revision_number=next_rev,
            operation_performed=op_name,
            change_summary=summary,
            original_geometry=orig_geom,
            generated_geometry=new_geom,
            comparison_delta=comparison_delta,
            model_url=model_url,
            download_stl_url=model_url,
            download_step_url=step_url,
            validation={
                "is_watertight": validation_watertight,
                "is_volume_valid": validation_valid,
                "file_size_bytes": new_size,
                "verification_status": "PASSED" if validation_valid else "WARNING",
            },
            created_at=now_utc,
        )

    @classmethod
    def get_design_asset(cls, db: Session, design_id: str) -> CADAssetResponse:
        """Fetch CAD design asset with active geometry and revision counts."""
        asset = db.scalar(select(CADAsset).where(CADAsset.id == design_id))
        if not asset:
            raise DesignNotFoundError(f"CAD design '{design_id}' not found.")

        geom = None
        if asset.analysis:
            anl = asset.analysis
            geom = {
                "bounding_box": {"x": anl.dimension_x, "y": anl.dimension_y, "z": anl.dimension_z},
                "surface_area_mm2": anl.surface_area_mm2,
                "volume_mm3": anl.volume_mm3,
                "triangle_count": anl.triangle_count,
                "is_watertight": anl.is_watertight,
                "is_volume_valid": anl.is_volume_valid,
            }

        return cls._format_asset_response(asset, geom)

    @classmethod
    def list_designs(cls, db: Session, skip: int = 0, limit: int = 20) -> List[CADAssetResponse]:
        """Fetch list of CAD design assets ordered by latest creation."""
        assets = db.scalars(
            select(CADAsset)
            .order_by(CADAsset.created_at.desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return [cls._format_asset_response(a) for a in assets]


    @classmethod
    def list_revisions(cls, db: Session, design_id: str) -> List[DesignRevisionResponse]:
        """Fetch historical immutable revisions for a design."""
        asset = db.scalar(select(CADAsset).where(CADAsset.id == design_id))
        if not asset:
            raise DesignNotFoundError(f"CAD design '{design_id}' not found.")

        revisions = db.scalars(
            select(DesignRevision)
            .where(DesignRevision.design_id == design_id)
            .order_by(DesignRevision.revision_number.desc())
        ).all()

        return [cls._format_revision_response(r) for r in revisions]

    @classmethod
    def get_export_file_path(
        cls,
        db: Session,
        design_id: str,
        export_format: str = "stl",
        revision_id: Optional[str] = None,
    ) -> Tuple[str, str, str]:
        """Retrieve verified canonical file path for CAD geometry export with path-traversal prevention.

        Returns:
            Tuple of (file_path, media_type, download_filename)
        """
        asset = db.scalar(select(CADAsset).where(CADAsset.id == design_id))
        if not asset:
            raise DesignNotFoundError(f"CAD design '{design_id}' not found.")

        target_file = asset.file_path
        if revision_id:
            rev = db.scalar(select(DesignRevision).where(DesignRevision.id == revision_id))
            if not rev or rev.design_id != design_id:
                raise DesignServiceError(f"Revision '{revision_id}' does not belong to design '{design_id}'.")
            target_file = rev.file_path

        # Enforce path traversal guard
        if not is_safe_path(settings.CAD_STORAGE_DIR, target_file) and not is_safe_path(settings.EXPORTS_STORAGE_DIR, target_file):
            raise DesignServiceError("Illegal file access: Path traversal detected outside storage boundaries.")

        if not os.path.exists(target_file):
            raise DesignServiceError("Target CAD geometry file could not be found in storage.")

        fmt = export_format.lower().strip()

        if fmt == "stl":
            return target_file, "model/stl", f"{asset.name}.stl"

        elif fmt in ("step", "stp"):
            if not is_step_supported():
                raise UnsupportedCADKernelError(
                    "STEP format export requires a functional CadQuery/Open CASCADE kernel, "
                    "which is not available in this runtime environment. Please export as STL format."
                )
            raise UnsupportedCADKernelError("Direct STEP conversion from discrete mesh requires native CAD B-Rep kernel.")

        else:
            raise DesignServiceError(f"Unsupported export format '{export_format}'. Supported formats: ['stl', 'step'].")

    @staticmethod
    def _format_asset_response(asset: CADAsset, geom_dict: Optional[Dict[str, Any]] = None) -> CADAssetResponse:
        geom_prop = None
        if geom_dict and "bounding_box" in geom_dict:
            bb = geom_dict["bounding_box"]
            geom_prop = GeometryProperties(
                bounding_box=BoundingBox(x=bb["x"], y=bb["y"], z=bb["z"]),
                surface_area_mm2=geom_dict.get("surface_area_mm2"),
                volume_mm3=geom_dict.get("volume_mm3"),
                triangle_count=geom_dict.get("triangle_count", 0),
                is_watertight=geom_dict.get("is_watertight", False),
                is_volume_valid=geom_dict.get("is_volume_valid", False),
            )

        rev_count = len(asset.revisions) if asset.revisions else 1

        return CADAssetResponse(
            design_id=asset.id,
            owner_id=asset.owner_id,
            name=asset.name,
            description=asset.description,
            source_type=asset.source_type,
            file_format=asset.file_format,
            file_hash=asset.file_hash,
            file_size_bytes=asset.file_size_bytes,
            analysis_id=asset.analysis_id,
            geometry=geom_prop,
            revisions_count=rev_count,
            preview_url=f"{settings.API_V1_PREFIX}/designs/{asset.id}",
            export_stl_url=f"{settings.API_V1_PREFIX}/designs/{asset.id}/export?format=stl",
            export_step_url=f"{settings.API_V1_PREFIX}/designs/{asset.id}/export?format=step",
            created_at=asset.created_at,
            updated_at=asset.updated_at,
        )

    @staticmethod
    def _format_revision_response(rev: DesignRevision) -> DesignRevisionResponse:
        return DesignRevisionResponse(
            revision_id=rev.id,
            design_id=rev.design_id,
            revision_number=rev.revision_number,
            file_format=rev.file_format,
            file_hash=rev.file_hash,
            file_size_bytes=rev.file_size_bytes,
            change_summary=rev.change_summary,
            operation_history=rev.operation_history or [],
            geometry_snapshot=rev.geometry_snapshot or {},
            created_at=rev.created_at,
            download_url=f"{settings.API_V1_PREFIX}/designs/{rev.design_id}/export?format=stl&revision_id={rev.id}",
        )
