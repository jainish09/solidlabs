"""Unit tests for DFM Rule Engine logic and technical checks."""

from app.services.dfm_engine import DFMEngine


def test_dfm_engine_watertight_cube():
    """Verify standard watertight cube passes manifold and envelope checks."""
    geometry = {
        "bounding_box": {"x": 50.0, "y": 50.0, "z": 50.0},
        "is_watertight": True,
        "is_volume_valid": True,
        "volume_mm3": 125000.0,
        "triangle_count": 2500,
        "surface_area_mm2": 15000.0,
    }

    findings = DFMEngine.evaluate(geometry, process="3d_printing_fdm")
    by_code = {f.check_code: f for f in findings}

    assert by_code["DFM_MESH_WATERTIGHT"].passed is True
    assert by_code["DFM_BUILD_VOLUME_OK"].passed is True
    assert by_code["DFM_ASPECT_RATIO_OK"].passed is True
    assert by_code["DFM_FACET_RESOLUTION_OK"].passed is True
    assert by_code["DFM_UNSUPPORTED_STL_CHECKS_DISCLAIMER"].passed is True


def test_dfm_engine_slender_rod():
    """Verify high-aspect ratio geometry triggers slenderness warning."""
    geometry = {
        "bounding_box": {"x": 4.0, "y": 4.0, "z": 120.0},
        "is_watertight": True,
        "is_volume_valid": True,
        "volume_mm3": 1500.0,
        "triangle_count": 800,
    }

    findings = DFMEngine.evaluate(geometry, process="cnc_machining_3axis")
    by_code = {f.check_code: f for f in findings}

    # 120 / 4 = 30:1 aspect ratio > 15:1 limit
    assert "DFM_HIGH_ASPECT_RATIO" in by_code
    assert by_code["DFM_HIGH_ASPECT_RATIO"].passed is False
    assert by_code["DFM_HIGH_ASPECT_RATIO"].severity == "warning"


def test_dfm_engine_cnc_envelope():
    """Verify CNC envelope check allows larger parts than FDM printer."""
    geometry = {
        "bounding_box": {"x": 450.0, "y": 280.0, "z": 150.0},
        "is_watertight": True,
        "is_volume_valid": True,
        "volume_mm3": 500000.0,
        "triangle_count": 12000,
    }

    # Fits CNC (600x400x300)
    cnc_findings = {f.check_code: f for f in DFMEngine.evaluate(geometry, process="cnc_machining_3axis")}
    assert cnc_findings["DFM_BUILD_VOLUME_OK"].passed is True

    # Exceeds FDM (250x250x300)
    fdm_findings = {f.check_code: f for f in DFMEngine.evaluate(geometry, process="3d_printing_fdm")}
    assert fdm_findings["DFM_BUILD_VOLUME_EXCEEDED"].passed is False


def test_dfm_engine_mesh_resolution_extremes():
    """Verify handling of low triangle counts and excessively high triangle counts."""
    # Under-resolved model
    low_res_geom = {
        "bounding_box": {"x": 100.0, "y": 100.0, "z": 100.0},
        "is_watertight": True,
        "is_volume_valid": True,
        "triangle_count": 24,  # Far too few for 100mm part
    }
    findings_low = {f.check_code: f for f in DFMEngine.evaluate(low_res_geom)}
    assert findings_low["DFM_LOW_FACET_RESOLUTION"].passed is False

    # Overly dense mesh
    high_res_geom = {
        "bounding_box": {"x": 50.0, "y": 50.0, "z": 50.0},
        "is_watertight": True,
        "is_volume_valid": True,
        "triangle_count": 2_000_000,
    }
    findings_high = {f.check_code: f for f in DFMEngine.evaluate(high_res_geom)}
    assert findings_high["DFM_EXCESSIVE_TRIANGLES"].passed is False
