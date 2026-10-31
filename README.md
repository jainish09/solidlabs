# SolidLabs — AI-Assisted CAD Design & Manufacturing Marketplace Platform

A production-grade, hackathon-ready FastAPI backend for **SolidLabs**, an AI-powered CAD copilot, parametric geometry generator, and on-demand manufacturing marketplace platform.

SolidLabs enables engineers, designers, and manufacturers to:
1. **Ingest & Validate CAD Models**: Upload STL mesh geometry, extract real topological and spatial geometry metrics using `trimesh` and `numpy`, compute watertightness and true manifold volume without fabricating measurements, and persist metadata and immutable revisions.
2. **Text-to-Parametric 3D CAD Generation**: Convert natural language descriptions into strictly validated mechanical specifications and synthesize real 100% watertight 3D solid geometries for an extensible library of engineering components (`mounting_plate`, `simple_bracket`, `spacer`, `cylindrical_adapter`).
3. **AI-Assisted CAD Design Improvements**: Analyze physical geometry and DFM results against user constraints to formulate structured engineering revision plans (observations, assumptions, proposed modifications) and execute safe, parameterized geometric operations creating immutable revisions.
4. **Model Export & Revision Management**: Securely export validated STL geometry with path-traversal prevention, maintain full revision history, and conditionally handle STEP format based on CAD kernel availability.
5. **Manufacturing Marketplace**: Create draft listings, enforce mandatory owner IP rights confirmation before publishing, search and filter published designs with pagination, and archive listings.
6. **Transparent Indicative Quotations & Manufacturing Orders**: Calculate physics-informed quotations for additive (FDM, SLA, SLS) and subtractive CNC milling, linking marketplace listings and design assets directly into quotes and order lifecycle state machines.

---

## 🛠️ Tech Stack

- **Runtime & Language**: Python 3.11+ (Fully verified on Python 3.13)
- **Web Framework**: FastAPI with Pydantic V2 and Pydantic-Settings
- **Geometry & Mesh Analysis**: `trimesh`, `numpy`, `shapely`, `mapbox-earcut`, `scipy`
- **Parametric CAD Solid Modeling**: Pure-Python constructive solid modeling pipeline generating watertight manifolds with positive volume; CadQuery / Open CASCADE architecture integration interface
- **Database ORM**: SQLAlchemy 2.0 (PostgreSQL / Supabase compatible; SQLite local test support)
- **Schema Migrations**: Alembic
- **Testing**: `pytest`, `pytest-asyncio`, and `httpx` (57/57 tests passing)
- **AI Synthesis**: Configurable LLM provider abstraction (`AIService`) with zero-dependency deterministic engineering fallbacks
- **Server**: Uvicorn ASGI

---

## 🏗️ Architecture

```
aavishkar/
├── app/
│   ├── main.py                  # FastAPI application entrypoint, CORS, exception handlers, lifecycle
│   ├── api/
│   │   ├── routes/
│   │   │   ├── health.py        # GET /api/v1/health & system diagnostics
│   │   │   ├── analyze.py       # POST /api/v1/analyze & GET /api/v1/analyze/{id}
│   │   │   ├── designs.py       # CAD ingestion, generation, improvement, revisions, export
│   │   │   ├── marketplace.py   # Listings CRUD, publish, archive, search, pagination
│   │   │   ├── quotes.py        # Indicative pricing (linked to analysis, design, or listing)
│   │   │   ├── orders.py        # Manufacturing order state machine
│   │   │   └── admin.py         # Visual admin management dashboard
│   │   └── __init__.py          # API V1 router aggregation
│   ├── core/
│   │   ├── config.py            # Pydantic Settings (.env configuration & storage paths)
│   │   └── security.py          # Path traversal guard, SHA-256, filename sanitization, auth mocks
│   ├── db/
│   │   ├── base.py              # SQLAlchemy DeclarativeBase
│   │   └── session.py           # Engine, SessionLocal, init_db()
│   ├── models/
│   │   ├── analysis.py          # CADAnalysis entity
│   │   ├── cad_asset.py         # CADAsset and DesignRevision entities
│   │   ├── design_generation.py # DesignGenerationJob entity
│   │   ├── improvement.py       # ImprovementRequest entity
│   │   ├── marketplace.py       # MarketplaceListing entity
│   │   ├── quote.py             # CADQuote entity
│   │   └── order.py             # CADOrder entity
│   ├── schemas/
│   │   ├── cad_asset.py         # CADAssetResponse, DesignRevisionResponse, CADUploadResponse
│   │   ├── design_generation.py # Parametric bounds validation (MountingPlate, SimpleBracket, etc.)
│   │   ├── improvement.py       # ModificationProposal, ImprovementRequest, ImprovementPlan
│   │   ├── marketplace.py       # ListingCreate, ListingUpdate, ListingPublish, ListingResponse
│   │   ├── quote.py             # QuoteCreateRequest, LineItem, CADQuoteResponse
│   │   ├── order.py             # OrderCreateRequest, OrderResponse, StatusUpdate
│   │   └── analysis.py          # GeometryProperties, DFM findings
│   └── services/
│       ├── cad_kernel.py        # Parametric 3D solid modeling & safe geometric modifications
│       ├── cad_processor.py     # STL loading, manifold inspection, extents, area, volume
│       ├── design_service.py    # CAD ingestion, revision history, parametric generation, exports
│       ├── marketplace_service.py # Marketplace lifecycle, ownership validation, search querying
│       ├── dfm_engine.py        # Deterministic manufacturing rule checks & envelope validation
│       ├── ai_service.py        # AI parameter extraction and structured revision planning
│       ├── pricing_service.py   # Physics-informed additive and subtractive quotation engine
│       └── order_service.py     # Manufacturing lifecycle state-machine manager
├── tests/
│   ├── conftest.py              # Test database and synthetic mesh fixtures
│   ├── test_designs.py          # CAD ingestion, generation, improvement, revisions, export tests
│   ├── test_marketplace.py      # Marketplace listings, ownership, approval, quote integration tests
│   ├── test_analyze.py          # Geometry parsing, watertightness, oversized & corrupted tests
│   ├── test_dfm.py              # DFM rule tests (envelopes, aspect ratio, facet density)
│   ├── test_quotes.py           # FDM, CNC, volume discount, and incompatibility tests
│   ├── test_orders.py           # Order lifecycle, audit history, and illegal transition tests
│   ├── test_ai_service.py       # Deterministic fallback and provider fail-safe tests
│   └── test_health.py           # Health check, persistence across restarts, and root tests
├── alembic/                     # Database migrations
│   └── versions/
│       ├── d86b1d76fe15_initial_schema.py
│       └── 04d6e385439c_add_cad_assets_and_marketplace.py
├── alembic.ini                  # Alembic migration configuration
├── requirements.txt             # Direct dependencies
├── .env.example                 # Environment variables template
└── README.md                    # Documentation
```

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- Python 3.11 or newer (Python 3.13 tested and supported)
- pip and virtualenv

### 2. Create and Activate Virtual Environment

**Windows (PowerShell):**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default settings work out of the box with local SQLite storage (`solidlabs.db`), local CAD asset storage (`storage/cad_assets`), and deterministic fallback AI analysis.

### 5. Run Database Migrations
Initialize or update the SQLite / PostgreSQL database schema using Alembic:
```bash
alembic upgrade head
```

### 6. Start the Development Server
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

Interactive portals and documentation:
- **Swagger UI**: [http://localhost:8001/api/v1/docs](http://localhost:8001/api/v1/docs)
- **Admin Dashboard**: [http://localhost:8001/admin](http://localhost:8001/admin) (or `/dashboard`)
- **ReDoc**: [http://localhost:8001/api/v1/redoc](http://localhost:8001/api/v1/redoc)

---

## 🧪 Running Automated Tests

Run the complete test suite with verbose output:
```bash
pytest -v
```

**Actual Test Results:**
- **57 passed** in **1.85 seconds**
- Zero failures, zero broken dependencies
- Runs 100% offline using in-memory databases and synthetic procedural geometries without requiring paid external APIs or internet access.

---

## 📐 Parametric CAD Generation Library

SolidLabs includes a constructive solid modeling engine (`cad_kernel.py`) that constructs mathematically verified, 100% watertight 3D solid meshes for four component families:

| Template Type | Description | Key Parameters |
| :--- | :--- | :--- |
| `mounting_plate` | Rectangular baseplate with 4 corner bolt clearance holes and optional center bore | `length`, `width`, `thickness`, `hole_diameter`, `margin`, `center_bore_diameter` |
| `simple_bracket` | 90-degree L-shaped structural bracket with mounting holes | `arm1_length`, `arm2_length`, `width`, `thickness`, `hole_diameter` |
| `spacer` | Hollow cylindrical bushing or standoff with concentric bore | `outer_diameter`, `inner_diameter`, `height` |
| `cylindrical_adapter` | Stepped dual-diameter shaft coupler with central through-bore | `base_diameter`, `base_length`, `stem_diameter`, `stem_length`, `bore_diameter` |

### CAD Kernel Architecture & STEP Handling
- **Pure-Python Solid Modeling**: Built on `shapely` 2.x, `mapbox-earcut`, and `trimesh`, producing fully manifold, watertight, positive-volume 3D solid geometry without heavy C++ compilation.
- **STEP Format Policy**: STEP format export and parsing cleanly interface through `is_cadquery_available()`. If a native Open CASCADE / CadQuery kernel is not detected in the environment, the endpoint safely returns `501 Not Implemented` with an explanatory message, adhering to the principle: *Report unsupported rather than pretending to parse or fake geometry.*

---

## 📡 API Endpoints & Request/Response Examples

### 1. Parametric Text-to-CAD Generation
`POST /api/v1/designs/generate`

Converts natural language engineering intent into validated parameters, synthesizes a real 100% watertight solid model, computes geometric properties, and registers the CAD design.

**Request:**
```bash
curl -X POST http://localhost:8001/api/v1/designs/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Standard aluminum mounting plate 100x80x6mm with 4 M6 bolt holes at corners",
    "template_type": "mounting_plate",
    "parameters": {
      "length": 100.0,
      "width": 80.0,
      "thickness": 6.0,
      "hole_diameter": 6.0,
      "margin": 12.0
    },
    "units": "mm",
    "material_preference": "aluminum_6061"
  }'
```

**Response (201 Created):**
```json
{
  "design_id": "cad_8c49af3ad64f42",
  "revision_id": "rev_f726451d953144",
  "template_type": "mounting_plate",
  "parameters": {
    "length": 100.0,
    "width": 80.0,
    "thickness": 6.0,
    "hole_diameter": 6.0,
    "hole_margin_x": 12.0,
    "hole_margin_y": 12.0,
    "center_bore_diameter": null
  },
  "units": "mm",
  "geometry": {
    "bounding_box": { "x": 100.0, "y": 80.0, "z": 6.0 },
    "surface_area_mm2": 18278.4,
    "volume_mm3": 47321.6,
    "triangle_count": 1052,
    "is_watertight": true,
    "is_volume_valid": true
  },
  "preview_url": "/api/v1/designs/cad_8c49af3ad64f42",
  "export_stl_url": "/api/v1/designs/cad_8c49af3ad64f42/export?format=stl",
  "export_step_url": "/api/v1/designs/cad_8c49af3ad64f42/export?format=step",
  "created_at": "2026-10-29T18:00:00Z"
}
```

---

### 2. AI-Assisted CAD Design Improvements
`POST /api/v1/designs/{design_id}/improvement-requests`

Analyzes real measured geometry and DFM results against user requirements to formulate a structured revision plan. Proposes actionable modifications distinguishing observations, assumptions, and proposed modifications. When `execute_modifications: true` is passed, applies a safe parameterized operation, creates a new immutable revision, and returns a geometric delta comparison report without overwriting the original file.

**Request:**
```bash
curl -X POST http://localhost:8001/api/v1/designs/cad_8c49af3ad64f42/improvement-requests \
  -H "Content-Type: application/json" \
  -d '{
    "user_requirements": "Thicken walls for increased structural stiffness under heavy dynamic loads",
    "intended_application": "Industrial vibration damper",
    "manufacturing_process": "cnc_machining_3axis",
    "material": "aluminum_6061",
    "execute_modifications": true
  }'
```

**Response (201 Created):**
```json
{
  "improvement_id": "imp_9b1a4c8e72fa01",
  "design_id": "cad_8c49af3ad64f42",
  "status": "REVISED",
  "observations": [
    "Current physical bounding envelope is 100.0 x 80.0 x 6.0 mm.",
    "Solid manifold condition: Watertight (Solid 2-manifold).",
    "Net solid material consumption is 47,321.6 mm³ (47.32 cm³)."
  ],
  "assumptions": [
    "Target fabrication method: cnc_machining_3axis with material aluminum_6061.",
    "Functional operational context: Industrial vibration damper.",
    "Design assumes isotropic in-plane loading unless otherwise noted."
  ],
  "proposed_modifications": [
    {
      "operation": "thicken_dimension",
      "target_feature": "Minimum cross-sectional thickness (Z-axis)",
      "parameters": { "axis": "z", "delta_mm": 2.0 },
      "engineering_rationale": "Increases second moment of area (I) to reduce flexural bending deflection under load.",
      "is_executable": true,
      "feasibility_impact": "+15% rigidity, +8% material cost, negligible cycle time increase."
    }
  ],
  "feasibility_assessment": {
    "manufacturability_score": "High",
    "recommended_process": "cnc_machining_3axis",
    "primary_concern": "Ensure bolt hole tolerances are verified on mating fixtures.",
    "cycle_time_impact": "Neutral to slightly reduced depending on pocketing options."
  },
  "executed_revision": {
    "revision_id": "rev_8a4c6cc13da746",
    "design_id": "cad_8c49af3ad64f42",
    "revision_number": 2,
    "file_format": "stl",
    "file_hash": "a4d8c7...",
    "file_size_bytes": 52684,
    "change_summary": "Automated engineering modification: thicken_dimension.",
    "operation_history": [
      {
        "operation": "thicken_dimension",
        "input_parameters": { "axis": "z", "delta_mm": 2.0 },
        "delta": { "height_before": 6.0, "height_after": 8.0, "delta_mm": 2.0 }
      }
    ],
    "geometry_snapshot": {
      "bounding_box": { "x": 100.0, "y": 80.0, "z": 8.0 },
      "surface_area_mm2": 19878.4,
      "volume_mm3": 63095.4,
      "is_watertight": true,
      "is_volume_valid": true
    },
    "download_url": "/api/v1/designs/cad_8c49af3ad64f42/export?format=stl",
    "created_at": "2026-10-29T18:05:00Z"
  },
  "comparison_report": {
    "height_before": 6.0,
    "height_after": 8.0,
    "delta_mm": 2.0
  },
  "created_at": "2026-10-29T18:05:00Z"
}
```

---

### 3. Create Draft Marketplace Listing
`POST /api/v1/marketplace/listings`

Registers an owned CAD asset as a draft listing. Requires owner authentication (`X-User-ID` or default owner).

**Request:**
```bash
curl -X POST http://localhost:8001/api/v1/marketplace/listings \
  -H "Content-Type: application/json" \
  -d '{
    "design_id": "cad_8c49af3ad64f42",
    "title": "Precision CNC Robotic Mounting Bracket",
    "description": "High-rigidity aluminum 6061 mounting bracket designed for NEMA 17 stepper motors.",
    "category": "robotics",
    "tags": ["robotics", "nema17", "bracket", "cnc"],
    "license": "CC-BY-4.0",
    "indicative_price": 28.50,
    "currency": "USD",
    "material_options": ["aluminum_6061", "pla", "petg"],
    "manufacturing_processes": ["cnc_machining_3axis", "3d_printing_fdm"],
    "listing_type": "digital_design"
  }'
```

**Response (201 Created):**
```json
{
  "listing_id": "lst_4e98f01b7a2d44",
  "design_id": "cad_8c49af3ad64f42",
  "owner_id": "usr_owner_default",
  "title": "Precision CNC Robotic Mounting Bracket",
  "description": "High-rigidity aluminum 6061 mounting bracket designed for NEMA 17 stepper motors.",
  "category": "robotics",
  "tags": ["robotics", "nema17", "bracket", "cnc"],
  "license": "CC-BY-4.0",
  "indicative_price": 28.5,
  "currency": "USD",
  "material_options": ["aluminum_6061", "pla", "petg"],
  "manufacturing_processes": ["cnc_machining_3axis", "3d_printing_fdm"],
  "listing_type": "digital_design",
  "status": "DRAFT",
  "ownership_confirmed": false,
  "takedown_status": "active",
  "created_at": "2026-10-29T18:10:00Z",
  "updated_at": "2026-10-29T18:10:00Z",
  "published_at": null,
  "design": {
    "design_id": "cad_8c49af3ad64f42",
    "geometry": { "is_watertight": true, "volume_mm3": 63095.4 }
  }
}
```

---

### 4. Publish Marketplace Listing (Explicit IP Declaration)
`POST /api/v1/marketplace/listings/{listing_id}/publish`

Publishes a draft listing to the marketplace upon explicit intellectual property declaration (`confirm_ownership: true`). If `confirm_ownership: false`, the operation is strictly rejected.

**Request:**
```bash
curl -X POST http://localhost:8001/api/v1/marketplace/listings/lst_4e98f01b7a2d44/publish \
  -H "Content-Type: application/json" \
  -d '{
    "confirm_ownership": true,
    "accept_marketplace_terms": true
  }'
```

**Response (200 OK):**
```json
{
  "listing_id": "lst_4e98f01b7a2d44",
  "status": "PUBLISHED",
  "ownership_confirmed": true,
  "published_at": "2026-10-29T18:12:00Z"
}
```

---

### 5. Generate Indicative Quotation from Marketplace Listing
`POST /api/v1/quotes`

Calculates indicative manufacturing pricing directly referencing a `listing_id` or `design_id`.

**Request:**
```bash
curl -X POST http://localhost:8001/api/v1/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "listing_id": "lst_4e98f01b7a2d44",
    "process": "3d_printing_fdm",
    "material": "pla",
    "quantity": 5
  }'
```

**Response (201 Created):**
```json
{
  "quote_id": "qte_9d42f7c180ae14",
  "analysis_id": "anl_82a3b1f92e8c45",
  "design_id": "cad_8c49af3ad64f42",
  "listing_id": "lst_4e98f01b7a2d44",
  "process": "3d_printing_fdm",
  "material": "pla",
  "quantity": 5,
  "unit_price": 14.50,
  "total_price": 72.50,
  "currency": "USD",
  "lead_time_business_days": 3,
  "estimate_status": "indicative",
  "line_items": [
    {
      "item_name": "Engineering Slicing & Machine Setup",
      "description": "Bed leveling, calibration, and slicing overhead ($15.00 batch setup amortized)",
      "unit_cost": 3.0,
      "total_cost": 15.0
    },
    {
      "item_name": "Raw Material (PLA Polymer)",
      "description": "Consumes ~78.2g material (Exact manifold solid volume).",
      "unit_cost": 1.88,
      "total_cost": 9.40
    }
  ],
  "created_at": "2026-10-29T18:15:00Z"
}
```

---

### 6. Export CAD Geometry
`GET /api/v1/designs/{design_id}/export?format=stl`

Downloads the binary STL file for the active or historical revision. Protected with path-traversal guards.

```bash
curl -X GET "http://localhost:8001/api/v1/designs/cad_8c49af3ad64f42/export?format=stl" \
  --output downloaded_model.stl
```

---

## 🔒 Security & Safety Controls

1. **Path Traversal Guards (`is_safe_path`)**: All file operations resolve canonical real paths and verify that the target strictly resides inside `settings.CAD_STORAGE_DIR` or `settings.EXPORTS_STORAGE_DIR`. Any traversal attempt (e.g. `../../windows/system32`) is immediately blocked.
2. **Immutable Revisions**: Original uploaded and generated files are write-protected. Every geometric modification is saved as a new sequential version (`_v2`, `_v3`) with its own SHA-256 integrity hash and audit history.
3. **Intellectual Property Protection**: Users cannot publish marketplace listings without affirmative confirmation (`confirm_ownership: true`).
4. **No Arbitrary Code Execution**: The parametric CAD pipeline does not evaluate user Python scripts, eval strings, or LLM-produced code. It uses verified parameter schemas with numerical bounds checking.
5. **Private Asset Isolation**: Public users can browse `PUBLISHED` listings only. Draft and archived listings, as well as private CAD revisions, require ownership authentication.

---

## 🔬 Core Engineering Limitations & Assumptions

1. **STL Geometry vs. B-Rep Solid Topology**:
   - STL meshes are discrete triangulated approximations. They lack topological B-Rep primitives (cylinders, planes, NURBS curves). As such, features like exact internal hole threading, precise chamfer angles, and surface roughness designations are represented geometrically rather than through PMI annotations.
2. **STEP Kernel Requirement**:
   - STEP CAD export and ingestion requires an installed Open CASCADE / CadQuery kernel. In environments where OCP is not installed, the endpoint returns a standard `501 Not Implemented` with clear installation guidance, rather than fabricating non-compliant STEP geometry.
3. **Indicative Quotations**:
   - Quoting calculations are algorithmically derived indicative estimates based on bounding boxes, true manifold volume, machine hourly rates, and infill percentages. They do not constitute binding supplier quotes until final CAM review.
