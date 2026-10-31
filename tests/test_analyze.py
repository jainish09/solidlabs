"""Tests for CAD STL upload, parsing, geometric analysis, and DFM findings."""

import io
from fastapi import status


def test_upload_valid_watertight_cube(client, valid_cube_stl_bytes):
    """Verify that a valid watertight 20x20x20 mm cube STL is parsed accurately."""
    files = {"file": ("cube.stl", valid_cube_stl_bytes, "application/octet-stream")}
    response = client.post("/api/v1/analyze?process=3d_printing_fdm&explain_with_ai=true", files=files)

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()

    assert data["analysis_id"].startswith("anl_")
    assert data["filename"] == "cube.stl"
    assert data["units"] == "mm"

    geom = data["geometry"]
    # 20x20x20 cube bounds
    assert abs(geom["bounding_box"]["x"] - 20.0) < 0.1
    assert abs(geom["bounding_box"]["y"] - 20.0) < 0.1
    assert abs(geom["bounding_box"]["z"] - 20.0) < 0.1

    # Surface area: 6 faces * 400 = 2400 mm^2
    assert abs(geom["surface_area_mm2"] - 2400.0) < 5.0

    # Volume: 20^3 = 8000 mm^3
    assert geom["volume_mm3"] is not None
    assert abs(geom["volume_mm3"] - 8000.0) < 10.0
    assert geom["is_watertight"] is True
    assert geom["is_volume_valid"] is True
    assert geom["triangle_count"] == 12

    # Check DFM findings
    findings = {f["check_code"]: f for f in data["dfm_findings"]}
    assert "DFM_MESH_WATERTIGHT" in findings
    assert findings["DFM_MESH_WATERTIGHT"]["passed"] is True
    assert "DFM_BUILD_VOLUME_OK" in findings
    assert findings["DFM_BUILD_VOLUME_OK"]["passed"] is True

    # Check AI explanation was generated (via fallback)
    assert data["ai_explanation"] is not None
    assert "Engineering DFM Synthesis" in data["ai_explanation"]


def test_upload_non_watertight_mesh(client, non_watertight_stl_bytes):
    """Verify that a non-watertight mesh yields null volume and clear DFM alerts."""
    files = {"file": ("open_box.stl", non_watertight_stl_bytes, "application/octet-stream")}
    response = client.post("/api/v1/analyze?process=3d_printing_fdm", files=files)

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()

    geom = data["geometry"]
    assert geom["is_watertight"] is False
    assert geom["is_volume_valid"] is False
    assert geom["volume_mm3"] is None  # Never invent volume when non-manifold

    # Check warnings
    assert any("non-watertight" in w.lower() for w in data["warnings"])

    # Check DFM finding
    findings = {f["check_code"]: f for f in data["dfm_findings"]}
    assert "DFM_NON_WATERTIGHT" in findings
    assert findings["DFM_NON_WATERTIGHT"]["passed"] is False
    assert findings["DFM_NON_WATERTIGHT"]["severity"] == "critical"


def test_upload_oversized_mesh(client, oversized_box_stl_bytes):
    """Verify that an oversized part is flagged as exceeding the machine envelope."""
    files = {"file": ("huge_part.stl", oversized_box_stl_bytes, "application/octet-stream")}
    response = client.post("/api/v1/analyze?process=3d_printing_fdm", files=files)

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()

    findings = {f["check_code"]: f for f in data["dfm_findings"]}
    assert "DFM_BUILD_VOLUME_EXCEEDED" in findings
    assert findings["DFM_BUILD_VOLUME_EXCEEDED"]["passed"] is False
    assert findings["DFM_BUILD_VOLUME_EXCEEDED"]["severity"] == "critical"


def test_upload_corrupted_file(client, corrupted_stl_bytes):
    """Verify that a non-STL binary or text file is safely rejected."""
    files = {"file": ("invalid.stl", corrupted_stl_bytes, "application/octet-stream")}
    response = client.post("/api/v1/analyze", files=files)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "STL format" in response.json()["detail"] or "parse" in response.json()["detail"].lower()


def test_upload_empty_file(client):
    """Verify that a 0-byte file upload is rejected with a descriptive error."""
    files = {"file": ("empty.stl", b"", "application/octet-stream")}
    response = client.post("/api/v1/analyze", files=files)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "empty" in response.json()["detail"].lower()


def test_upload_invalid_extension(client):
    """Verify that non-.stl extensions are rejected."""
    files = {"file": ("drawing.pdf", b"%PDF-1.4...", "application/pdf")}
    response = client.post("/api/v1/analyze", files=files)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Unsupported file format" in response.json()["detail"]


def test_get_analysis_by_id(client, valid_cube_stl_bytes):
    """Verify fetching an existing analysis record by ID."""
    files = {"file": ("query_test.stl", valid_cube_stl_bytes, "application/octet-stream")}
    create_resp = client.post("/api/v1/analyze", files=files)
    analysis_id = create_resp.json()["analysis_id"]

    get_resp = client.get(f"/api/v1/analyze/{analysis_id}")
    assert get_resp.status_code == status.HTTP_200_OK
    data = get_resp.json()
    assert data["analysis_id"] == analysis_id
    assert data["filename"] == "query_test.stl"


def test_get_nonexistent_analysis_returns_404(client):
    """Verify 404 for an analysis ID that does not exist."""
    response = client.get("/api/v1/analyze/anl_nonexistent999999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
