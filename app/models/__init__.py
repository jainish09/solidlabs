"""Models package registering all entities with SQLAlchemy DeclarativeBase."""

from app.models.analysis import CADAnalysis
from app.models.quote import CADQuote
from app.models.order import CADOrder
from app.models.cad_asset import CADAsset, DesignRevision
from app.models.design_generation import DesignGenerationJob
from app.models.improvement import ImprovementRequest
from app.models.marketplace import MarketplaceListing

__all__ = [
    "CADAnalysis",
    "CADQuote",
    "CADOrder",
    "CADAsset",
    "DesignRevision",
    "DesignGenerationJob",
    "ImprovementRequest",
    "MarketplaceListing",
]
