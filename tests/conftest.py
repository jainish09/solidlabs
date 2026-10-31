"""Pytest fixtures and test synthetic CAD generation helpers."""

import io
import pytest
import numpy as np
import trimesh
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db.session import get_db

# Use in-memory SQLite for isolated, blazing-fast automated tests
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create all database tables for test session."""
    import app.models  # noqa: F401
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    """Provide a clean isolated transactional database session per test."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    """FastAPI TestClient with overridden database dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def valid_cube_stl_bytes() -> bytes:
    """Generate a clean, watertight 20x20x20 mm cube STL in memory."""
    mesh = trimesh.creation.box(extents=(20.0, 20.0, 20.0))
    buffer = io.BytesIO()
    mesh.export(buffer, file_type="stl")
    return buffer.getvalue()


@pytest.fixture
def non_watertight_stl_bytes() -> bytes:
    """Generate an open surface (non-watertight shell) with boundary edges."""
    vertices = np.array([
        [0.0, 0.0, 0.0],
        [25.0, 0.0, 0.0],
        [25.0, 25.0, 0.0],
        [0.0, 25.0, 0.0],
    ], dtype=float)
    faces = np.array([
        [0, 1, 2],
        [0, 2, 3],
    ], dtype=int)
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces, process=False)
    buffer = io.BytesIO()
    mesh.export(buffer, file_type="stl")
    return buffer.getvalue()


@pytest.fixture
def oversized_box_stl_bytes() -> bytes:
    """Generate an oversized 400x350x320 mm box STL exceeding standard FDM envelopes."""
    mesh = trimesh.creation.box(extents=(400.0, 350.0, 320.0))
    buffer = io.BytesIO()
    mesh.export(buffer, file_type="stl")
    return buffer.getvalue()


@pytest.fixture
def slender_rod_stl_bytes() -> bytes:
    """Generate a high-aspect-ratio cylinder (e.g. 100mm long by 4mm diameter, ratio ~25:1)."""
    mesh = trimesh.creation.cylinder(radius=2.0, height=100.0)
    buffer = io.BytesIO()
    mesh.export(buffer, file_type="stl")
    return buffer.getvalue()


@pytest.fixture
def corrupted_stl_bytes() -> bytes:
    """Corrupted / non-STL dummy payload."""
    return b"This is plainly an invalid text file and NOT a valid 3D polygon STL mesh."
