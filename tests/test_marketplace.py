"""Comprehensive automated tests for 3D Design Marketplace, Ownership, Publishing, and Quotation Integration."""

import io
from fastapi.testclient import TestClient


def _create_sample_design(client: TestClient, valid_cube_stl_bytes: bytes) -> str:
    """Helper to upload a design asset and return its design_id."""
    res = client.post(
        "/api/v1/designs/upload",
        files={"file": ("marketplace_bracket.stl", io.BytesIO(valid_cube_stl_bytes), "application/sla")},
        params={"description": "Standard mounting bracket for marketplace"},
    )
    assert res.status_code == 201
    return res.json()["design"]["design_id"]


def test_create_draft_listing_for_owned_design(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify that a user can create a draft marketplace listing for their owned design."""
    design_id = _create_sample_design(client, valid_cube_stl_bytes)

    payload = {
        "design_id": design_id,
        "title": "Precision CNC Robotic Mounting Bracket",
        "description": "High-rigidity aluminum 6061 mounting bracket designed for NEMA 17 stepper motors.",
        "category": "robotics",
        "tags": ["robotics", "nema17", "bracket", "cnc"],
        "license": "CC-BY-4.0",
        "indicative_price": 28.50,
        "currency": "USD",
        "material_options": ["aluminum_6061", "pla", "petg"],
        "manufacturing_processes": ["cnc_machining_3axis", "3d_printing_fdm"],
        "listing_type": "digital_design",
    }

    response = client.post("/api/v1/marketplace/listings", json=payload)
    assert response.status_code == 201, response.text
    data = response.json()

    assert data["listing_id"].startswith("lst_")
    assert data["design_id"] == design_id
    assert data["title"] == "Precision CNC Robotic Mounting Bracket"
    assert data["status"] == "DRAFT"
    assert data["ownership_confirmed"] is False
    assert data["indicative_price"] == 28.50
    assert data["design"]["geometry"]["is_watertight"] is True


def test_create_listing_for_nonexistent_design(client: TestClient):
    """Verify error when referencing a design that does not exist."""
    payload = {
        "design_id": "cad_nonexistent0000",
        "title": "Phantom Design Listing",
        "description": "This design does not exist in the database.",
        "category": "mechanical_components",
        "tags": ["test"],
        "indicative_price": 10.0,
        "material_options": ["pla"],
        "manufacturing_processes": ["3d_printing_fdm"],
    }
    response = client.post("/api/v1/marketplace/listings", json=payload)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_create_listing_unauthorized_user(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify that a user cannot create a listing for an asset owned by someone else."""
    design_id = _create_sample_design(client, valid_cube_stl_bytes)

    payload = {
        "design_id": design_id,
        "title": "Stolen Design Attempt",
        "description": "Trying to list someone else's CAD geometry.",
        "category": "robotics",
        "tags": ["unauthorized"],
        "indicative_price": 50.0,
        "material_options": ["pla"],
        "manufacturing_processes": ["3d_printing_fdm"],
    }
    # Impersonate stranger user
    headers = {"X-User-ID": "usr_stranger_intruder"}
    response = client.post("/api/v1/marketplace/listings", json=payload, headers=headers)
    assert response.status_code == 403
    assert "Forbidden" in response.json()["detail"] or "owner" in response.json()["detail"].lower()


def test_publish_listing_requires_explicit_ownership_confirmation(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify that publishing is strictly blocked unless the owner confirms IP ownership and distribution rights."""
    design_id = _create_sample_design(client, valid_cube_stl_bytes)

    create_res = client.post(
        "/api/v1/marketplace/listings",
        json={
            "design_id": design_id,
            "title": "Unconfirmed IP Design",
            "description": "Attempting to publish without affirming IP rights.",
            "category": "tooling",
            "tags": ["ip"],
            "indicative_price": 15.0,
            "material_options": ["pla"],
            "manufacturing_processes": ["3d_printing_fdm"],
        },
    )
    listing_id = create_res.json()["listing_id"]

    # Attempt to publish with confirm_ownership = False
    publish_res = client.post(
        f"/api/v1/marketplace/listings/{listing_id}/publish",
        json={"confirm_ownership": False},
    )
    assert publish_res.status_code == 400
    assert "intellectual property" in publish_res.json()["detail"].lower() or "ownership" in publish_res.json()["detail"].lower()


def test_publish_listing_success(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify that confirming rights transitions listing to PUBLISHED status with a published_at timestamp."""
    design_id = _create_sample_design(client, valid_cube_stl_bytes)

    create_res = client.post(
        "/api/v1/marketplace/listings",
        json={
            "design_id": design_id,
            "title": "Autonomous Rover Chassis Adapter",
            "description": "Verified robotic rover wheel coupler.",
            "category": "robotics",
            "tags": ["rover", "chassis"],
            "indicative_price": 35.0,
            "material_options": ["aluminum_6061"],
            "manufacturing_processes": ["cnc_machining_3axis"],
        },
    )
    listing_id = create_res.json()["listing_id"]

    # Publish with explicit rights confirmation
    publish_res = client.post(
        f"/api/v1/marketplace/listings/{listing_id}/publish",
        json={"confirm_ownership": True},
    )
    assert publish_res.status_code == 200, publish_res.text
    data = publish_res.json()

    assert data["status"] == "PUBLISHED"
    assert data["ownership_confirmed"] is True
    assert data["published_at"] is not None


def test_update_marketplace_listing(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify modifying permitted draft fields such as title, price, and tags."""
    design_id = _create_sample_design(client, valid_cube_stl_bytes)

    create_res = client.post(
        "/api/v1/marketplace/listings",
        json={
            "design_id": design_id,
            "title": "Initial Title",
            "description": "Original description.",
            "category": "tooling",
            "tags": ["initial"],
            "indicative_price": 20.0,
            "material_options": ["pla"],
            "manufacturing_processes": ["3d_printing_fdm"],
        },
    )
    listing_id = create_res.json()["listing_id"]

    # Update listing
    patch_res = client.patch(
        f"/api/v1/marketplace/listings/{listing_id}",
        json={
            "title": "Refined CNC Fixture Plate",
            "indicative_price": 32.0,
            "tags": ["fixtures", "cnc", "tooling"],
        },
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["title"] == "Refined CNC Fixture Plate"
    assert updated["indicative_price"] == 32.0
    assert "tooling" in updated["tags"]


def test_list_published_listings_search_and_pagination(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify marketplace search, category filtering, and public access rules."""
    design_id = _create_sample_design(client, valid_cube_stl_bytes)

    # 1. Create and publish a robotics listing
    pub_res = client.post(
        "/api/v1/marketplace/listings",
        json={
            "design_id": design_id,
            "title": "Aerospace Drone Arm Mount",
            "description": "Carbon fiber reinforced drone motor mount.",
            "category": "robotics",
            "tags": ["drone", "aerospace"],
            "indicative_price": 45.0,
            "material_options": ["nylon"],
            "manufacturing_processes": ["3d_printing_sls"],
        },
    )
    drone_listing_id = pub_res.json()["listing_id"]
    client.post(f"/api/v1/marketplace/listings/{drone_listing_id}/publish", json={"confirm_ownership": True})

    # 2. Search by query 'Drone'
    search_res = client.get("/api/v1/marketplace/listings", params={"q": "Drone"})
    assert search_res.status_code == 200
    data = search_res.json()
    assert data["total"] >= 1
    found_ids = [item["listing_id"] for item in data["items"]]
    assert drone_listing_id in found_ids

    # 3. Filter by category 'robotics'
    cat_res = client.get("/api/v1/marketplace/listings", params={"category": "robotics"})
    assert cat_res.status_code == 200
    assert any(item["listing_id"] == drone_listing_id for item in cat_res.json()["items"])


def test_archive_marketplace_listing(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify owner can archive a listing, removing it from public search results."""
    design_id = _create_sample_design(client, valid_cube_stl_bytes)

    create_res = client.post(
        "/api/v1/marketplace/listings",
        json={
            "design_id": design_id,
            "title": "To Be Retired Listing",
            "description": "Old prototype part.",
            "category": "tooling",
            "tags": ["deprecated"],
            "indicative_price": 5.0,
            "material_options": ["pla"],
            "manufacturing_processes": ["3d_printing_fdm"],
        },
    )
    listing_id = create_res.json()["listing_id"]
    client.post(f"/api/v1/marketplace/listings/{listing_id}/publish", json={"confirm_ownership": True})

    # Archive the listing
    archive_res = client.post(f"/api/v1/marketplace/listings/{listing_id}/archive")
    assert archive_res.status_code == 200
    assert archive_res.json()["status"] == "ARCHIVED"

    # Query public listings: archived listing should not be returned to public users
    headers = {"X-User-ID": "usr_public_shopper"}
    list_res = client.get("/api/v1/marketplace/listings", headers=headers)
    public_items = [i["listing_id"] for i in list_res.json()["items"]]
    assert listing_id not in public_items


def test_quote_generation_from_marketplace_listing(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify generating an indicative manufacturing quote directly referencing a marketplace listing."""
    design_id = _create_sample_design(client, valid_cube_stl_bytes)

    create_res = client.post(
        "/api/v1/marketplace/listings",
        json={
            "design_id": design_id,
            "title": "Marketplace Quoting Test Item",
            "description": "Ready to be quoted for fabrication.",
            "category": "mechanical_components",
            "tags": ["quote"],
            "indicative_price": 20.0,
            "material_options": ["pla"],
            "manufacturing_processes": ["3d_printing_fdm"],
        },
    )
    listing_id = create_res.json()["listing_id"]

    # Request quotation referencing the listing_id
    quote_payload = {
        "listing_id": listing_id,
        "process": "3d_printing_fdm",
        "material": "pla",
        "quantity": 5,
    }
    quote_res = client.post("/api/v1/quotes", json=quote_payload)
    assert quote_res.status_code == 201, quote_res.text
    q_data = quote_res.json()

    assert q_data["quote_id"].startswith("qte_")
    assert q_data["listing_id"] == listing_id
    assert q_data["design_id"] == design_id
    assert q_data["quantity"] == 5
    assert q_data["total_price"] > 0
    assert q_data["estimate_status"] == "indicative"
    assert len(q_data["line_items"]) > 0


def test_quote_generation_from_design_id(client: TestClient, valid_cube_stl_bytes: bytes):
    """Verify generating a quote directly from a CAD design ID without specifying raw analysis_id."""
    design_id = _create_sample_design(client, valid_cube_stl_bytes)

    quote_payload = {
        "design_id": design_id,
        "process": "cnc_machining_3axis",
        "material": "aluminum_6061",
        "quantity": 10,
    }
    quote_res = client.post("/api/v1/quotes", json=quote_payload)
    assert quote_res.status_code == 201, quote_res.text
    q_data = quote_res.json()

    assert q_data["design_id"] == design_id
    assert q_data["total_price"] > 0
    assert q_data["lead_time_business_days"] > 0
