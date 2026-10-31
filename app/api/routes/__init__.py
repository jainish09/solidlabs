"""API routes registration module."""

from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.analyze import router as analyze_router
from app.api.routes.quotes import router as quotes_router
from app.api.routes.orders import router as orders_router
from app.api.routes.admin import router as admin_router
from app.api.routes.designs import router as designs_router
from app.api.routes.marketplace import router as marketplace_router
from app.api.routes.studio import router as studio_router

api_router = APIRouter()
api_router.include_router(health_router, prefix="", tags=["Health"])
api_router.include_router(analyze_router, prefix="", tags=["CAD Analysis & DFM"])
api_router.include_router(designs_router, prefix="", tags=["CAD Designs & Generation"])
api_router.include_router(marketplace_router, prefix="", tags=["Marketplace"])
api_router.include_router(quotes_router, prefix="", tags=["Quotations"])
api_router.include_router(orders_router, prefix="", tags=["Manufacturing Orders"])
api_router.include_router(admin_router, prefix="", tags=["Admin"])
api_router.include_router(studio_router, prefix="", tags=["3D Studio"])

__all__ = ["api_router"]


