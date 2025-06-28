"""Database models for the notes service."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel
from sqlalchemy import ARRAY, DateTime, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base class for all database models."""

    pass


class NoteModel(Base):
    """SQLAlchemy model for notes."""

    __tablename__ = "notes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    widget_id: Mapped[str] = mapped_column(String(36), nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    labels: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    x: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    y: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    width: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    height: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    source: Mapped[str] = mapped_column(String(20), default="local", nullable=False)
    obsidian_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class Note(BaseModel):
    """Pydantic model for notes business logic."""

    id: str
    widget_id: str
    title: str
    content: str
    labels: List[str] = []
    created_at: datetime
    updated_at: datetime
    x: Optional[int] = None
    y: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    source: str = "local"
    obsidian_path: Optional[str] = None
