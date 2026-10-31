"""Tests for AI Service and Deterministic Fallback synthesis."""

from unittest.mock import patch, MagicMock
from app.services.ai_service import AIService
from app.core.config import settings


def test_ai_service_deterministic_fallback():
    """Verify high-grade deterministic synthesis when no AI credentials are provided."""
    service = AIService()

    geometry = {
        "bounding_box": {"x": 30.0, "y": 20.0, "z": 15.0},
        "surface_area_mm2": 2700.0,
        "volume_mm3": 9000.0,
        "triangle_count": 120,
        "is_watertight": True,
        "is_volume_valid": True,
    }
    findings = [
        {
            "check_code": "DFM_MESH_WATERTIGHT",
            "check_name": "Solid Manifold Topology",
            "severity": "info",
            "passed": True,
            "explanation": "Mesh is closed.",
            "suggested_action": "No repair needed.",
        }
    ]

    report = service.generate_explanation("test_part.stl", "mm", geometry, findings)
    assert "Engineering DFM Synthesis for test_part.stl" in report
    assert "30.0 x 20.0 x 15.0 mm" in report
    assert "9,000.00 mm³" in report
    assert "Solid shell is continuous" in report


def test_ai_service_handles_missing_credentials_safely():
    """Verify that empty or invalid API key defaults cleanly without raising exceptions."""
    with patch.object(settings, "AI_API_KEY", ""):
        with patch.object(settings, "AI_PROVIDER", "none"):
            service = AIService()
            res = service.generate_explanation("widget.stl", "mm", {"bounding_box": {"x": 10, "y": 10, "z": 10}}, [])
            assert isinstance(res, str)
            assert len(res) > 50


def test_ai_service_provider_error_falls_back():
    """Verify that a network timeout or provider HTTP error falls back to deterministic synthesis."""
    with patch.object(settings, "AI_API_KEY", "sk-mock-fake-key"):
        with patch.object(settings, "AI_PROVIDER", "openai"):
            service = AIService()

            # Mock httpx.Client to simulate network outage / timeout
            with patch("httpx.Client.post", side_effect=Exception("Connection timed out to AI provider")):
                report = service.generate_explanation(
                    "flange.stl",
                    "mm",
                    {"bounding_box": {"x": 100, "y": 50, "z": 20}, "is_watertight": True, "volume_mm3": 45000},
                    [],
                )
                assert isinstance(report, str)
                # Falls back to deterministic synthesis without throwing error
                assert "Engineering DFM Synthesis for flange.stl" in report
