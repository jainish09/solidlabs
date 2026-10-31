"""Security, file validation, and authorization helpers.

NOTE: This is a hackathon prototype implementation. Production deployments
must incorporate authenticated sessions (e.g., JWT / OAuth2 via Supabase Auth
or Auth0) and Role-Based Access Control (RBAC) prior to exposing order status
modification endpoints to public networks.
"""

import hashlib
import os
import re
from typing import Tuple


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal and special character injection."""
    clean_name = os.path.basename(filename)
    # Strip any characters outside safe alphanumeric, dash, underscore, and dot
    clean_name = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", clean_name)
    if not clean_name:
        clean_name = "unnamed_upload.stl"
    return clean_name


def calculate_sha256(filepath: str) -> str:
    """Compute SHA-256 hash of a file for integrity tracking and deduplication."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def validate_stl_header(header_bytes: bytes) -> Tuple[bool, str]:
    """Inspect file header bytes to confirm STL format without executing contents.

    Returns:
        (is_valid, stl_format_type: 'binary' | 'ascii' | 'unknown')
    """
    if len(header_bytes) < 5:
        return False, "unknown"

    # Check for ASCII STL
    try:
        header_text = header_bytes[:80].decode("ascii", errors="ignore").strip().lower()
        if header_text.startswith("solid"):
            return True, "ascii"
    except Exception:
        pass

    # Binary STL requires at least 84 bytes: 80 bytes header + 4 bytes uint32 triangle count
    if len(header_bytes) >= 84:
        return True, "binary"

    return False, "unknown"


def validate_step_header(header_bytes: bytes) -> bool:
    """Inspect file header bytes for STEP (ISO 10303-21) signatures."""
    if len(header_bytes) < 10:
        return False
    try:
        text = header_bytes[:128].decode("ascii", errors="ignore").strip().upper()
        return "ISO-10303-21" in text or "HEADER;" in text
    except Exception:
        return False


def is_safe_path(base_dir: str, target_path: str) -> bool:
    """Verify that target_path resolves strictly within base_dir to block path traversal."""
    try:
        canonical_base = os.path.realpath(os.path.abspath(base_dir))
        canonical_target = os.path.realpath(os.path.abspath(target_path))
        # Ensure common prefix matches base directory exactly
        return os.path.commonpath([canonical_base]) == os.path.commonpath([canonical_base, canonical_target])
    except Exception:
        return False


from fastapi import Header, HTTPException, status


def get_current_user(x_user_id: str = Header(default="usr_owner_default", description="Mock or authenticated user identifier")) -> str:
    """Dependency extracting the acting user ID.

    In production: Replace with verified JWT token decode (OAuth2/Supabase Auth).
    In this prototype: Accepts X-User-ID header with fallback to default demo user.
    """
    clean_id = re.sub(r"[^a-zA-Z0-9_\-]", "", x_user_id.strip())
    if not clean_id:
        return "usr_owner_default"
    return clean_id


def require_owner(current_user: str, resource_owner: str, action: str = "modify") -> None:
    """Enforce ownership checks for private assets, revisions, and listing edits."""
    if current_user != resource_owner and current_user != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: You are not authorized to {action} this resource. Required owner: '{resource_owner}'."
        )

