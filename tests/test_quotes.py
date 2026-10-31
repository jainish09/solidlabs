"""Tests for Indicative Quotation Engine and pricing equations."""

from fastapi import status


def _create_test_analysis(client, stl_bytes, filename="part.stl"):
    files = {"file": (filename, stl_bytes, "application/octet-stream")}
    resp = client.post("/api/v1/analyze", files=files)
    assert resp.status_code == status.HTTP_201_CREATED
    return resp.json()["analysis_id"]


def test_quote_3d_printing_fdm(client, valid_cube_stl_bytes):
    """Verify transparent FDM 3D printing quote generation for PLA."""
    analysis_id = _create_test_analysis(client, valid_cube_stl_bytes)

    payload = {
        "analysis_id": analysis_id,
        "process": "3d_printing_fdm",
        "material": "pla",
        "quantity": 5,
        "finish": "standard_as_machined",
    }
    response = client.post("/api/v1/quotes", json=payload)
    assert response.status_code == status.HTTP_201_CREATED

    data = response.json()
    assert data["quote_id"].startswith("qte_")
    assert data["analysis_id"] == analysis_id
    assert data["process"] == "3d_printing_fdm"
    assert data["material"] == "pla"
    assert data["quantity"] == 5
    assert data["currency"] == "USD"
    assert data["estimate_status"] == "indicative"
    assert data["unit_price"] > 0.0
    assert abs(data["total_price"] - round(data["unit_price"] * 5, 2)) < 0.05
    assert data["lead_time_business_days"] >= 3

    # Check line items
    item_names = [item["item_name"] for item in data["line_items"]]
    assert any("Setup" in name for name in item_names)
    assert any("Material" in name for name in item_names)
    assert any("Machine Time" in name for name in item_names)
    assert any("Finishing" in name for name in item_names)

    # Check explicit assumptions
    assumptions = data["pricing_assumptions"]
    assert assumptions["calculation_model"] == "Additive Infill & Extrusion Physics"
    assert assumptions["approximate_volume_used"] is False
    assert "disclaimer" in assumptions


def test_quote_cnc_machining_aluminum(client, valid_cube_stl_bytes):
    """Verify CNC machining quote with billet stock allowance and spindle runtime."""
    analysis_id = _create_test_analysis(client, valid_cube_stl_bytes)

    payload = {
        "analysis_id": analysis_id,
        "process": "cnc_machining_3axis",
        "material": "aluminum_6061",
        "quantity": 1,
        "finish": "bead_blasted",
    }
    response = client.post("/api/v1/quotes", json=payload)
    assert response.status_code == status.HTTP_201_CREATED

    data = response.json()
    assert data["process"] == "cnc_machining_3axis"
    assert data["material"] == "aluminum_6061"

    # CNC includes CAM programming setup fee
    item_names = [item["item_name"] for item in data["line_items"]]
    assert any("CAM Programming" in name for name in item_names)
    assert any("Raw Stock Billet" in name for name in item_names)
    assert any("Spindle Runtime" in name for name in item_names)

    assumptions = data["pricing_assumptions"]
    assert assumptions["calculation_model"] == "Subtractive Billet MRR & Surface Finishing Physics"
    # 20mm cube + 6mm stock margin = 26mm billet dimension
    assert assumptions["stock_dimensions_mm"]["x"] >= 25.0


def test_quote_batch_volume_discount(client, valid_cube_stl_bytes):
    """Verify economies of scale: per-unit price for 50 parts is lower than for 1 part."""
    analysis_id = _create_test_analysis(client, valid_cube_stl_bytes)

    resp_single = client.post(
        "/api/v1/quotes",
        json={"analysis_id": analysis_id, "process": "3d_printing_fdm", "material": "pla", "quantity": 1},
    )
    resp_batch = client.post(
        "/api/v1/quotes",
        json={"analysis_id": analysis_id, "process": "3d_printing_fdm", "material": "pla", "quantity": 50},
    )

    unit_price_1 = resp_single.json()["unit_price"]
    unit_price_50 = resp_batch.json()["unit_price"]
    assert unit_price_50 < unit_price_1


def test_quote_incompatible_material_process(client, valid_cube_stl_bytes):
    """Verify that specifying an incompatible material (e.g. Aluminum for FDM 3D printer) fails."""
    analysis_id = _create_test_analysis(client, valid_cube_stl_bytes)

    payload = {
        "analysis_id": analysis_id,
        "process": "3d_printing_fdm",
        "material": "aluminum_6061",  # Not printable on standard FDM!
        "quantity": 1,
    }
    response = client.post("/api/v1/quotes", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "not compatible with process" in response.json()["detail"]


def test_quote_on_non_watertight_geometry(client, non_watertight_stl_bytes):
    """Verify that quote on open-boundary mesh flags approximate volume usage."""
    analysis_id = _create_test_analysis(client, non_watertight_stl_bytes, "open.stl")

    payload = {
        "analysis_id": analysis_id,
        "process": "3d_printing_fdm",
        "material": "pla",
        "quantity": 2,
    }
    response = client.post("/api/v1/quotes", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["pricing_assumptions"]["approximate_volume_used"] is True


def test_get_quote_by_id(client, valid_cube_stl_bytes):
    """Verify fetching quote by ID."""
    analysis_id = _create_test_analysis(client, valid_cube_stl_bytes)
    create_resp = client.post(
        "/api/v1/quotes",
        json={"analysis_id": analysis_id, "process": "3d_printing_fdm", "material": "pla", "quantity": 2},
    )
    quote_id = create_resp.json()["quote_id"]

    get_resp = client.get(f"/api/v1/quotes/{quote_id}")
    assert get_resp.status_code == status.HTTP_200_OK
    assert get_resp.json()["quote_id"] == quote_id


def test_get_nonexistent_quote_returns_404(client):
    """Verify 404 for quote that does not exist."""
    response = client.get("/api/v1/quotes/qte_nonexistent999999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
