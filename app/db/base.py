"""Declarative base class for SQLAlchemy 2.x models."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base model class with common attributes."""
    pass
