"""Tests for Manufacturing Order creation, retrieval, and status lifecycle state machine."""

from fastapi import status


def _create_test_quote(client, valid_cube_stl_bytes):
    files = {"file": ("part.stl", valid_cube_stl_bytes, "application/octet-stream")}
    anl_resp = client.post("/api/v1/analyze", files=files)
    analysis_id = anl_resp.json()["analysis_id"]

    q_resp = client.post(
        "/api/v1/quotes",
        json={"analysis_id": analysis_id, "process": "3d_printing_fdm", "material": "pla", "quantity": 3},
    )
    return q_resp.json()["quote_id"]


def test_create_order_success(client, valid_cube_stl_bytes):
    """Verify placing a valid order linked to an existing quote."""
    quote_id = _create_test_quote(client, valid_cube_stl_bytes)

    payload = {
        "quote_id": quote_id,
        "customer_name": "Dr. Sarah Connor",
        "customer_email": "sarah.connor@cyberdyne.org",
        "shipping_address": "8404 Resistance Way, Los Angeles, CA 90001",
        "notes": "Urgent prototype needed for testing.",
    }
    response = client.post("/api/v1/orders", json=payload)
    assert response.status_code == status.HTTP_201_CREATED

    data = response.json()
    assert data["order_id"].startswith("ord_")
    assert data["quote_id"] == quote_id
    assert data["customer_name"] == "Dr. Sarah Connor"
    assert data["status"] == "REQUESTED"
    assert data["total_price"] > 0.0

    # Verify audit history initialized
    assert len(data["status_history"]) == 1
    assert data["status_history"][0]["to_status"] == "REQUESTED"


def test_create_order_nonexistent_quote(client):
    """Verify order creation fails if quote ID does not exist."""
    payload = {
        "quote_id": "qte_nonexistent999999",
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "shipping_address": "123 Main St",
    }
    response = client.post("/api/v1/orders", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "does not exist" in response.json()["detail"]


def test_order_lifecycle_state_machine(client, valid_cube_stl_bytes):
    """Verify full successful lifecycle transition:

    REQUESTED -> APPROVED -> IN_PRODUCTION -> QUALITY_CHECK -> DELIVERED.
    """
    quote_id = _create_test_quote(client, valid_cube_stl_bytes)
    order_resp = client.post(
        "/api/v1/orders",
        json={
            "quote_id": quote_id,
            "customer_name": "Tony Stark",
            "customer_email": "tony@stark.com",
            "shipping_address": "10880 Malibu Point, Malibu, CA 90265",
        },
    )
    order_id = order_resp.json()["order_id"]

    # 1. Transition: REQUESTED -> APPROVED
    resp_approve = client.patch(
        f"/api/v1/orders/{order_id}/status",
        json={"new_status": "APPROVED", "notes": "Credit check and CAM model approved."},
    )
    assert resp_approve.status_code == status.HTTP_200_OK
    assert resp_approve.json()["status"] == "APPROVED"

    # 2. Transition: APPROVED -> IN_PRODUCTION
    resp_prod = client.patch(
        f"/api/v1/orders/{order_id}/status",
        json={"new_status": "IN_PRODUCTION", "notes": "Dispatched to FDM Printer #04."},
    )
    assert resp_prod.status_code == status.HTTP_200_OK
    assert resp_prod.json()["status"] == "IN_PRODUCTION"

    # 3. Transition: IN_PRODUCTION -> QUALITY_CHECK
    resp_qc = client.patch(
        f"/api/v1/orders/{order_id}/status",
        json={"new_status": "QUALITY_CHECK", "notes": "CMM optical scan inspection."},
    )
    assert resp_qc.status_code == status.HTTP_200_OK
    assert resp_qc.json()["status"] == "QUALITY_CHECK"

    # 4. Transition: QUALITY_CHECK -> DELIVERED
    resp_deliv = client.patch(
        f"/api/v1/orders/{order_id}/status",
        json={"new_status": "DELIVERED", "notes": "Signed and received by customer."},
    )
    assert resp_deliv.status_code == status.HTTP_200_OK
    assert resp_deliv.json()["status"] == "DELIVERED"

    # Check status history records all 5 milestones
    order_data = resp_deliv.json()
    assert len(order_data["status_history"]) == 5


def test_order_invalid_state_transition_rejected(client, valid_cube_stl_bytes):
    """Verify illegal transitions (e.g.

    skipping from REQUESTED directly to DELIVERED) are rejected.
    """
    quote_id = _create_test_quote(client, valid_cube_stl_bytes)
    order_resp = client.post(
        "/api/v1/orders",
        json={
            "quote_id": quote_id,
            "customer_name": "Bruce Wayne",
            "customer_email": "bruce@wayne.com",
            "shipping_address": "1007 Mountain Drive, Gotham",
        },
    )
    order_id = order_resp.json()["order_id"]

    # Try skipping directly to DELIVERED
    bad_transition = client.patch(
        f"/api/v1/orders/{order_id}/status",
        json={"new_status": "DELIVERED", "notes": "Trying to skip manufacturing!"},
    )
    assert bad_transition.status_code == status.HTTP_400_BAD_REQUEST
    detail = bad_transition.json()["detail"]
    assert "Illegal state transition from 'REQUESTED' to 'DELIVERED'" in detail
    assert "Allowed target states from 'REQUESTED'" in detail


def test_list_orders_pagination_and_filtering(client, valid_cube_stl_bytes):
    """Verify listing orders with skip, limit, and status filter."""
    quote_id = _create_test_quote(client, valid_cube_stl_bytes)

    # Create two orders
    client.post(
        "/api/v1/orders",
        json={"quote_id": quote_id, "customer_name": "User 1", "customer_email": "u1@test.com", "shipping_address": "Addr 1"},
    )
    client.post(
        "/api/v1/orders",
        json={"quote_id": quote_id, "customer_name": "User 2", "customer_email": "u2@test.com", "shipping_address": "Addr 2"},
    )

    list_resp = client.get("/api/v1/orders?limit=10&status=REQUESTED")
    assert list_resp.status_code == status.HTTP_200_OK
    data = list_resp.json()
    assert data["total"] >= 2
    assert len(data["items"]) >= 2
    assert data["items"][0]["status"] == "REQUESTED"


def test_get_order_by_id_with_quote(client, valid_cube_stl_bytes):
    """Verify retrieving order by ID returns embedded quote details."""
    quote_id = _create_test_quote(client, valid_cube_stl_bytes)
    order_resp = client.post(
        "/api/v1/orders",
        json={"quote_id": quote_id, "customer_name": "User 3", "customer_email": "u3@test.com", "shipping_address": "Addr 3"},
    )
    order_id = order_resp.json()["order_id"]

    get_resp = client.get(f"/api/v1/orders/{order_id}")
    assert get_resp.status_code == status.HTTP_200_OK
    data = get_resp.json()
    assert data["order_id"] == order_id
    assert data["quote"] is not None
    assert data["quote"]["quote_id"] == quote_id


def test_get_nonexistent_order_returns_404(client):
    """Verify 404 for order that does not exist."""
    response = client.get("/api/v1/orders/ord_nonexistent999999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
