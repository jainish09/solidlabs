"""SolidLabs AI Manufacturing Backend - Main FastAPI Application."""

import logging
import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.db.session import init_db
from app.api.routes import api_router
from app.services.cad_processor import CADProcessingError
from app.services.pricing_service import PricingError
from app.services.order_service import (
    OrderError,
    OrderNotFoundError,
    InvalidStateTransitionError,
)
from app.services.cad_kernel import UnsupportedCADKernelError, CADKernelError
from app.services.design_service import DesignNotFoundError, DesignServiceError
from app.services.marketplace_service import ListingNotFoundError, MarketplaceError


# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("solidlabs")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup and shutdown lifecycle manager."""
    logger.info("Initializing SolidLabs Manufacturing Platform Backend...")
    # Initialize database tables
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        raise e

    yield

    logger.info("Shutting down SolidLabs Backend...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Production-grade, AI-powered Manufacturing Backend for SolidLabs. "
        "Provides CAD STL file ingestion, exact geometry analysis, rule-based Design for "
        "Manufacturing (DFM) verification, AI-powered engineering explanations, transparent "
        "indicative quotations for additive (FDM/SLA/SLS) and subtractive CNC milling, "
        "and order lifecycle management."
    ),
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request timing and structured logging middleware
@app.middleware("http")
async def request_logger_middleware(request: Request, call_next):
    start_time = time.time()
    response = None
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(
            f"{request.method} {request.url.path} -> {response.status_code} ({process_time:.2f}ms)"
        )
        response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
        return response
    except Exception as e:
        process_time = (time.time() - start_time) * 1000
        logger.error(
            f"{request.method} {request.url.path} FAILED after {process_time:.2f}ms: {type(e).__name__} - {str(e)}"
        )
        raise e


# Exception Handlers for Clean, Standardized JSON Errors
@app.exception_handler(OrderNotFoundError)
async def order_not_found_handler(request: Request, exc: OrderNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exc), "error_type": "OrderNotFound"},
    )


@app.exception_handler(InvalidStateTransitionError)
async def invalid_transition_handler(request: Request, exc: InvalidStateTransitionError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc), "error_type": "InvalidStateTransition"},
    )


@app.exception_handler(CADProcessingError)
async def cad_error_handler(request: Request, exc: CADProcessingError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc), "error_type": "CADProcessingError"},
    )


@app.exception_handler(PricingError)
async def pricing_error_handler(request: Request, exc: PricingError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc), "error_type": "PricingError"},
    )


@app.exception_handler(OrderError)
async def generic_order_error_handler(request: Request, exc: OrderError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc), "error_type": "OrderError"},
    )


@app.exception_handler(UnsupportedCADKernelError)
async def unsupported_cad_kernel_handler(request: Request, exc: UnsupportedCADKernelError):
    return JSONResponse(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        content={"detail": str(exc), "error_type": "UnsupportedCADKernel"},
    )


@app.exception_handler(DesignNotFoundError)
async def design_not_found_handler(request: Request, exc: DesignNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exc), "error_type": "DesignNotFound"},
    )


@app.exception_handler(ListingNotFoundError)
async def listing_not_found_handler(request: Request, exc: ListingNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exc), "error_type": "ListingNotFound"},
    )


@app.exception_handler(DesignServiceError)
async def design_service_error_handler(request: Request, exc: DesignServiceError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc), "error_type": "DesignServiceError"},
    )


@app.exception_handler(MarketplaceError)
async def marketplace_error_handler(request: Request, exc: MarketplaceError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc), "error_type": "MarketplaceError"},
    )


@app.exception_handler(CADKernelError)
async def cad_kernel_error_handler(request: Request, exc: CADKernelError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc), "error_type": "CADKernelError"},
    )



@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    clean_errors = []
    for err in errors:
        loc = " -> ".join([str(x) for x in err.get("loc", [])])
        clean_errors.append(f"{loc}: {err.get('msg')}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "; ".join(clean_errors),
            "error_type": "ValidationError",
            "errors": clean_errors,
        },
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_type": "HTTPException"},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server error on {request.method} {request.url.path}")
    # Shield raw internal tracebacks from external consumers
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred while processing the request.",
            "error_type": "InternalServerError",
        },
    )


# Mount API V1 routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

from app.api.routes.admin import get_admin_dashboard
from app.api.routes.studio import get_ai_3d_studio

# Mount Admin Portal directly at /admin and /dashboard for quick browser access
app.add_api_route("/admin", get_admin_dashboard, methods=["GET"], include_in_schema=False)
app.add_api_route("/dashboard", get_admin_dashboard, methods=["GET"], include_in_schema=False)
app.add_api_route("/studio", get_ai_3d_studio, methods=["GET"], include_in_schema=False)
app.add_api_route("/ai-studio", get_ai_3d_studio, methods=["GET"], include_in_schema=False)
app.add_api_route("/3d-studio", get_ai_3d_studio, methods=["GET"], include_in_schema=False)


# Root redirect or greeting
@app.get("/", tags=["Root"])
def root_info(request: Request):
    # If requested by a standard web browser, redirect directly to /admin
    accept_header = request.headers.get("accept", "")
    if "text/html" in accept_header:
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url="/admin")

    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "admin_dashboard": "/admin",
        "documentation": f"{settings.API_V1_PREFIX}/docs",
        "health_check": f"{settings.API_V1_PREFIX}/health",
    }

