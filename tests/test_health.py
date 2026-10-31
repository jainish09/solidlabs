"""Tests for service health and diagnostics."""

from fastapi import status


def test_health_check_endpoint(client):
    """Verify /api/v1/health returns 200 OK and valid diagnostic data."""
    response = client.get("/api/v1/health")
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert data["status"] == "healthy"
    assert data["database_connected"] is True
    assert "version" in data
    assert data["uptime_seconds"] >= 0.0
    assert "timestamp" in data


def test_root_endpoint(client):
    """Verify root GET / returns basic service discovery information."""
    response = client.get("/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "SolidLabs" in data["service"]
    assert "/api/v1/docs" in data["documentation"]
    assert "/admin" in data["admin_dashboard"]


def test_admin_dashboard_endpoint(client):
    """Verify /admin and /dashboard endpoints return 200 with HTML portal."""
    resp_admin = client.get("/admin")
    assert resp_admin.status_code == status.HTTP_200_OK
    assert "text/html" in resp_admin.headers["content-type"]
    assert "SolidLabs" in resp_admin.text
    assert "Manufacturing OS" in resp_admin.text

    resp_dash = client.get("/dashboard")
    assert resp_dash.status_code == status.HTTP_200_OK
    assert "text/html" in resp_dash.headers["content-type"]


def test_database_persistence_across_restarts(tmp_path):
    """Verify database persistence and schema preservation across application restarts."""
    import uuid
    import datetime
    from sqlalchemy import create_engine, select
    from sqlalchemy.orm import sessionmaker
    from app.db.base import Base
    from app.models.cad_asset import CADAsset

    db_file = tmp_path / "test_persistence.db"
    db_url = f"sqlite:///{db_file}"

    # First session: Initialize database schema and insert CADAsset record
    engine1 = create_engine(db_url)
    Base.metadata.create_all(bind=engine1)
    Session1 = sessionmaker(bind=engine1)

    asset_id = f"cad_{uuid.uuid4().hex[:14]}"
    with Session1() as s1:
        asset = CADAsset(
            id=asset_id,
            owner_id="usr_persistence_test",
            name="persisted_bracket.stl",
            source_type="generated",
            file_path="/storage/test.stl",
            file_format="stl",
            file_hash="abc123hash",
            file_size_bytes=1024,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            updated_at=datetime.datetime.now(datetime.timezone.utc),
        )
        s1.add(asset)
        s1.commit()
    engine1.dispose()

    # Second session: Simulate application restart with new engine connecting to same file
    engine2 = create_engine(db_url)
    Session2 = sessionmaker(bind=engine2)
    with Session2() as s2:
        reloaded = s2.scalar(select(CADAsset).where(CADAsset.id == asset_id))
        assert reloaded is not None
        assert reloaded.id == asset_id
        assert reloaded.name == "persisted_bracket.stl"
        assert reloaded.owner_id == "usr_persistence_test"
    engine2.dispose()


