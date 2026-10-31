"""Comprehensive automated tests for CAD Ingestion, Parametric Generation, Revisions, AI Improvement, and Export."""

import io
import trimesh
from fastapi.testclient import TestClient


def test_upload_stl_registers_asset_and_v1_revision(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify that uploading an STL registers a CADAsset and an immutable revision v1."""
    response = client.post(
        "/api/v1/designs/upload",
        files={"file": ("test_bracket_v1.stl", io.BytesIO(valid_cube_stl_bytes), "application/sla")},
        params={"units": "mm", "process": "3d_printing_fdm", "description": "Mounting block"},
    )
    assert response.status_code == 201, response.text
    data = response.json()

    assert data["design"]["design_id"].startswith("cad_")
    assert data["design"]["name"] == "test_bracket_v1.stl"
    assert data["design"]["source_type"] == "upload"
    assert data["design"]["file_format"] == "stl"
    assert data["design"]["analysis_id"] is not None

    # Verify initial revision
    assert data["initial_revision"]["revision_number"] == 1
    assert data["initial_revision"]["design_id"] == data["design"]["design_id"]

    # Verify measured geometry
    geo = data["design"]["geometry"]
    assert geo["is_watertight"] is True
    assert geo["is_volume_valid"] is True
    assert round(geo["volume_mm3"], 1) == 8000.0  # 20x20x20 cube


def test_upload_step_unsupported_notice(client: TestClient):
    """Verify that attempting to upload a STEP file returns a 501 Unsupported response when CAD kernel is absent."""
    dummy_step = b"ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('SolidLabs CAD'),'2;1');\nENDSEC;\nEND-ISO-10303-21;"
    response = client.post(
        "/api/v1/designs/upload",
        files={"file": ("model.step", io.BytesIO(dummy_step), "application/step")},
    )
    assert response.status_code == 501
    assert "Open CASCADE" in response.json()["detail"] or "CadQuery" in response.json()["detail"]


def test_upload_invalid_extension(client: TestClient):
    """Verify that unsupported non-CAD extensions are cleanly rejected."""
    response = client.post(
        "/api/v1/designs/upload",
        files={"file": ("notes.txt", io.BytesIO(b"Hello world"), "text/plain")},
    )
    assert response.status_code == 400
    assert "Unsupported file extension" in response.json()["detail"]


def test_upload_empty_cad_file(client: TestClient):
    """Verify that an empty file stream is rejected."""
    response = client.post(
        "/api/v1/designs/upload",
        files={"file": ("empty.stl", io.BytesIO(b""), "application/sla")},
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_generate_parametric_mounting_plate(client: TestClient):
    """Verify parametric generation of a watertight mounting plate with 4 bolt holes."""
    payload = {
        "prompt": "Standard aluminum mounting plate 100x80x6mm with 4 M6 bolt holes at corners",
        "template_type": "mounting_plate",
        "parameters": {
            "length": 100.0,
            "width": 80.0,
            "thickness": 6.0,
            "hole_diameter": 6.0,
            "margin": 12.0,
        },
        "units": "mm",
        "material_preference": "aluminum_6061",
    }
    response = client.post("/api/v1/designs/generate", json=payload)
    assert response.status_code == 201, response.text
    data = response.json()

    assert data["design_id"].startswith("cad_")
    assert data["template_type"] == "mounting_plate"
    assert data["revision_id"].startswith("rev_")

    # Geometry verification
    geo = data["geometry"]
    assert geo["is_watertight"] is True
    assert geo["is_volume_valid"] is True
    # Bounding box should match 100 x 80 x 6
    bbox = geo["bounding_box"]
    assert round(bbox["x"], 1) == 100.0
    assert round(bbox["y"], 1) == 80.0
    assert round(bbox["z"], 1) == 6.0
    # Volume: solid plate minus holes is approx 47321 mm³
    assert 45000 < geo["volume_mm3"] < 48000

    # Verify export URLs
    assert f"/designs/{data['design_id']}/export?format=stl" in data["export_stl_url"]



def test_generate_parametric_simple_bracket(client: TestClient):
    """Verify parametric generation of a watertight L-bracket."""
    payload = {
        "prompt": "Heavy-duty 90-degree corner support bracket",
        "template_type": "simple_bracket",
        "parameters": {
            "arm1_length": 60.0,
            "arm2_length": 50.0,
            "width": 30.0,
            "thickness": 5.0,
        },
        "units": "mm",
    }
    response = client.post("/api/v1/designs/generate", json=payload)
    assert response.status_code == 201, response.text
    data = response.json()

    assert data["template_type"] == "simple_bracket"
    assert data["geometry"]["is_watertight"] is True
    assert data["geometry"]["volume_mm3"] > 0


def test_generate_parametric_spacer(client: TestClient):
    """Verify parametric generation of a watertight cylindrical spacer."""
    payload = {
        "prompt": "30mm OD cylindrical spacer with 12mm central bolt clearance hole",
        "template_type": "spacer",
        "parameters": {
            "outer_diameter": 30.0,
            "inner_diameter": 12.0,
            "height": 15.0,
        },
        "units": "mm",
    }
    response = client.post("/api/v1/designs/generate", json=payload)
    assert response.status_code == 201, response.text
    data = response.json()

    assert data["template_type"] == "spacer"
    assert data["geometry"]["is_watertight"] is True
    assert data["geometry"]["volume_mm3"] > 0


def test_generate_parametric_cylindrical_adapter(client: TestClient):
    """Verify parametric generation of a stepped cylindrical adapter with a bore."""
    payload = {
        "prompt": "Stepped shaft coupler adapter 40mm to 24mm diameter with 12mm through bore",
        "template_type": "cylindrical_adapter",
        "parameters": {
            "base_diameter": 40.0,
            "base_length": 15.0,
            "stem_diameter": 24.0,
            "stem_length": 20.0,
            "bore_diameter": 12.0,
        },
    }
    response = client.post("/api/v1/designs/generate", json=payload)
    assert response.status_code == 201, response.text
    data = response.json()

    assert data["template_type"] == "cylindrical_adapter"
    assert data["geometry"]["is_watertight"] is True
    assert round(data["geometry"]["bounding_box"]["z"], 1) == 35.0  # 15 + 20


def test_generate_parameter_validation_bounds_rejection(client: TestClient):
    """Verify strict Pydantic bounds validation rejects impossible geometry."""
    # Hole diameter exceeds margin constraint
    payload_bad_hole = {
        "prompt": "Invalid mounting plate with oversized holes",
        "template_type": "mounting_plate",
        "parameters": {
            "length": 100.0,
            "width": 80.0,
            "thickness": 5.0,
            "hole_diameter": 30.0,  # 30 >= 2 * 12 = 24 -> rejected!
            "margin": 12.0,
        },
    }
    res = client.post("/api/v1/designs/generate", json=payload_bad_hole)
    assert res.status_code in (400, 422)

    # Spacer inner diameter >= outer diameter
    payload_bad_spacer = {
        "prompt": "Invalid spacer",
        "template_type": "spacer",
        "parameters": {
            "outer_diameter": 20.0,
            "inner_diameter": 25.0,  # Inner > outer!
            "height": 10.0,
        },
    }
    res = client.post("/api/v1/designs/generate", json=payload_bad_spacer)
    assert res.status_code in (400, 422)


def test_get_design_and_revisions(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify fetching design metadata and revision history."""
    upload_res = client.post(
        "/api/v1/designs/upload",
        files={"file": ("box.stl", io.BytesIO(valid_cube_stl_bytes), "application/sla")},
    )
    design_id = upload_res.json()["design"]["design_id"]

    # Fetch design details
    get_res = client.get(f"/api/v1/designs/{design_id}")
    assert get_res.status_code == 200
    assert get_res.json()["design_id"] == design_id
    assert get_res.json()["name"] == "box.stl"

    # Fetch revisions
    revs_res = client.get(f"/api/v1/designs/{design_id}/revisions")
    assert revs_res.status_code == 200
    revs = revs_res.json()
    assert len(revs) == 1
    assert revs[0]["revision_number"] == 1

    # Nonexistent design
    not_found = client.get("/api/v1/designs/cad_nonexistent999")
    assert not_found.status_code == 404


def test_list_designs(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify paginated listing of registered CAD designs."""
    # Create a design first
    client.post(
        "/api/v1/designs/upload",
        files={"file": ("listable.stl", io.BytesIO(valid_cube_stl_bytes), "application/sla")},
    )
    res = client.get("/api/v1/designs?skip=0&limit=10")
    assert res.status_code == 200
    items = res.json()
    assert isinstance(items, list)
    assert len(items) >= 1
    assert "design_id" in items[0]


def test_ai_improvement_request_structured_plan(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify AI-assisted design improvement proposes a structured plan without altering geometry."""
    upload_res = client.post(
        "/api/v1/designs/upload",
        files={"file": ("box.stl", io.BytesIO(valid_cube_stl_bytes), "application/sla")},
    )
    design_id = upload_res.json()["design"]["design_id"]

    req_payload = {
        "user_requirements": "Lightweight this block and optimize for CNC milling with aluminum 6061",
        "intended_application": "Robotics chassis mounting bracket",
        "manufacturing_process": "cnc_machining_3axis",
        "material": "aluminum_6061",
        "execute_modifications": False,
    }

    res = client.post(f"/api/v1/designs/{design_id}/improvement-requests", json=req_payload)
    assert res.status_code == 201, res.text
    data = res.json()

    assert data["design_id"] == design_id
    assert data["status"] == "PLANNED"
    assert data["executed_revision"] is None

    assert len(data["observations"]) > 0
    assert len(data["assumptions"]) > 0
    assert len(data["proposed_modifications"]) > 0
    assert "manufacturability_score" in data["feasibility_assessment"]


def test_ai_improvement_request_with_safe_modification(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify executing safe parameterized modification creates a new revision without overwriting v1."""
    upload_res = client.post(
        "/api/v1/designs/upload",
        files={"file": ("bracket_block.stl", io.BytesIO(valid_cube_stl_bytes), "application/sla")},
    )
    design_id = upload_res.json()["design"]["design_id"]
    initial_rev_id = upload_res.json()["initial_revision"]["revision_id"]

    req_payload = {
        "user_requirements": "Thicken walls for increased structural stiffness under heavy dynamic loads",
        "intended_application": "Industrial vibration damper",
        "manufacturing_process": "cnc_machining_3axis",
        "material": "aluminum_6061",
        "execute_modifications": True,
    }

    res = client.post(f"/api/v1/designs/{design_id}/improvement-requests", json=req_payload)
    assert res.status_code == 201, res.text
    data = res.json()

    assert data["status"] == "REVISED"
    assert data["executed_revision"] is not None
    assert data["executed_revision"]["revision_number"] == 2
    assert data["comparison_report"] is not None

    # Verify revisions history has 2 distinct entries
    revs_res = client.get(f"/api/v1/designs/{design_id}/revisions")
    revs = revs_res.json()
    assert len(revs) == 2
    rev_ids = [r["revision_id"] for r in revs]
    assert initial_rev_id in rev_ids
    assert data["executed_revision"]["revision_id"] in rev_ids



def test_export_design_stl(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify secure download of design geometry in STL format."""
    upload_res = client.post(
        "/api/v1/designs/upload",
        files={"file": ("export_test.stl", io.BytesIO(valid_cube_stl_bytes), "application/sla")},
    )
    design_id = upload_res.json()["design"]["design_id"]

    export_res = client.get(f"/api/v1/designs/{design_id}/export?format=stl")
    assert export_res.status_code == 200

    # Parse exported file with trimesh to verify byte integrity
    exported_mesh = trimesh.load(io.BytesIO(export_res.content), file_type="stl")
    assert exported_mesh.is_watertight is True
    assert len(exported_mesh.faces) > 0


def test_export_design_step_unsupported_when_kernel_absent(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify export in STEP format returns 501 Unsupported when CadQuery/Open CASCADE is not installed."""
    upload_res = client.post(
        "/api/v1/designs/upload",
        files={"file": ("export_test.stl", io.BytesIO(valid_cube_stl_bytes), "application/sla")},
    )
    design_id = upload_res.json()["design"]["design_id"]

    export_res = client.get(f"/api/v1/designs/{design_id}/export?format=step")
    assert export_res.status_code == 501
    assert "CadQuery" in export_res.json()["detail"] or "Open CASCADE" in export_res.json()["detail"]


def test_transform_design_scale(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify transforming a design by scaling produces different valid geometry in revision v2."""
    upload_res = client.post(
        "/api/v1/designs/upload",
        files={"file": ("scalable_box.stl", io.BytesIO(valid_cube_stl_bytes), "application/sla")},
    )
    design_id = upload_res.json()["design"]["design_id"]

    trans_payload = {
        "prompt": "Scale the model by 1.2x",
        "units": "mm",
        "manufacturing_process": "3d_printing_fdm",
    }
    res = client.post(f"/api/v1/designs/{design_id}/transform", json=trans_payload)
    assert res.status_code == 200
    data = res.json()

    assert data["success"] is True
    assert data["operation_performed"] == "scale_geometry"
    assert data["new_revision_number"] == 2
    assert data["generated_geometry"]["volume_mm3"] > data["original_geometry"]["volume_mm3"]
    assert data["generated_geometry"]["is_watertight"] is True
    assert data["validation"]["is_watertight"] is True
    assert data["model_url"] is not None

    # Check that original revision is preserved and unchanged
    export_v1 = client.get(f"/api/v1/designs/{design_id}/export?format=stl&revision_id={data['original_revision_id']}")
    assert export_v1.status_code == 200
    m_v1 = trimesh.load(io.BytesIO(export_v1.content), file_type="stl")
    assert round(float(m_v1.volume), 1) == round(float(data["original_geometry"]["volume_mm3"]), 1)


def test_transform_design_add_mounting_holes(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify adding mounting holes drills real holes through geometry reducing volume."""
    upload_res = client.post(
        "/api/v1/designs/upload",
        files={"file": ("drilled_box.stl", io.BytesIO(valid_cube_stl_bytes), "application/sla")},
    )
    design_id = upload_res.json()["design"]["design_id"]

    trans_payload = {
        "prompt": "Add two mounting holes of diameter 4mm",
        "units": "mm",
        "manufacturing_process": "cnc_machining_3axis",
    }
    res = client.post(f"/api/v1/designs/{design_id}/transform", json=trans_payload)
    assert res.status_code == 200
    data = res.json()

    assert data["success"] is True
    assert data["operation_performed"] == "add_mounting_holes"
    assert data["generated_geometry"]["volume_mm3"] < data["original_geometry"]["volume_mm3"]
    assert data["generated_geometry"]["is_watertight"] is True
    assert data["validation"]["is_watertight"] is True


def test_transform_design_unsupported_request_rejection(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify unsupported requests produce helpful rejection with supported alternatives."""
    upload_res = client.post(
        "/api/v1/designs/upload",
        files={"file": ("test_part.stl", io.BytesIO(valid_cube_stl_bytes), "application/sla")},
    )
    design_id = upload_res.json()["design"]["design_id"]

    trans_payload = {
        "prompt": "Convert this box into a freeform clay sculpt",
        "units": "mm",
    }
    res = client.post(f"/api/v1/designs/{design_id}/transform", json=trans_payload)
    assert res.status_code == 200
    data = res.json()

    assert data["success"] is False
    assert data["error_message"] is not None
    assert "supported_alternatives" in data
    assert len(data["supported_alternatives"]) > 0
