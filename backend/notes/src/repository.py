"""Repository layer for note data operations."""

from typing import List, Optional

from sqlalchemy import delete, select

from .database import AsyncSessionLocal
from .models import Note, NoteModel


class NoteRepository:
    """Repository for note data operations."""

    @staticmethod
    async def get_notes_by_widget(
        widget_id: str, label_filter: Optional[List[str]] = None
    ) -> List[Note]:
        """Get notes from database for a specific widget."""
        async with AsyncSessionLocal() as session:
            query = select(NoteModel).where(NoteModel.widget_id == widget_id)

            if label_filter:
                query = query.where(NoteModel.labels.overlap(label_filter))

            query = query.order_by(NoteModel.updated_at.desc())

            result = await session.execute(query)
            note_models = result.scalars().all()

            return [
                NoteRepository._model_to_note(note_model) for note_model in note_models
            ]

    @staticmethod
    async def get_note_by_id(note_id: str) -> Optional[Note]:
        """Get a single note from database."""
        async with AsyncSessionLocal() as session:
            query = select(NoteModel).where(NoteModel.id == note_id)
            result = await session.execute(query)
            note_model = result.scalar_one_or_none()

            if not note_model:
                return None

            return NoteRepository._model_to_note(note_model)

    @staticmethod
    async def save_note(note: Note) -> Note:
        """Save note to database."""
        async with AsyncSessionLocal() as session:
            existing_note = await session.get(NoteModel, note.id)

            if existing_note:
                NoteRepository._update_model_from_note(existing_note, note)
            else:
                note_model = NoteRepository._note_to_model(note)
                session.add(note_model)

            await session.commit()
            return note

    @staticmethod
    async def delete_note(note_id: str) -> bool:
        """Delete note from database."""
        async with AsyncSessionLocal() as session:
            query = delete(NoteModel).where(NoteModel.id == note_id)
            result = await session.execute(query)
            await session.commit()
            return result.rowcount > 0

    @staticmethod
    async def delete_notes_by_widget(widget_id: str) -> int:
        """Delete all notes for a specific widget."""
        async with AsyncSessionLocal() as session:
            query = delete(NoteModel).where(NoteModel.widget_id == widget_id)
            result = await session.execute(query)
            await session.commit()
            return result.rowcount

    @staticmethod
    async def get_note_by_title_and_widget(
        title: str, widget_id: str
    ) -> Optional[Note]:
        """Get a note by title and widget ID."""
        async with AsyncSessionLocal() as session:
            query = select(NoteModel).where(
                NoteModel.title == title,
                NoteModel.widget_id == widget_id,
            )
            result = await session.execute(query)
            note_model = result.scalar_one_or_none()

            if not note_model:
                return None

            return NoteRepository._model_to_note(note_model)

    @staticmethod
    async def get_note_by_obsidian_path(obsidian_path: str) -> Optional[Note]:
        """Get a note by its Obsidian path."""
        async with AsyncSessionLocal() as session:
            query = select(NoteModel).where(NoteModel.obsidian_path == obsidian_path)
            result = await session.execute(query)
            note_model = result.scalar_one_or_none()

            if not note_model:
                return None

            return NoteRepository._model_to_note(note_model)

    @staticmethod
    def _model_to_note(note_model: NoteModel) -> Note:
        """Convert SQLAlchemy model to Pydantic model."""
        return Note(
            id=note_model.id,
            widget_id=note_model.widget_id,
            title=note_model.title,
            content=note_model.content,
            labels=note_model.labels or [],
            created_at=note_model.created_at,
            updated_at=note_model.updated_at,
            x=note_model.x,
            y=note_model.y,
            width=note_model.width,
            height=note_model.height,
            source=getattr(note_model, "source", "local"),
            obsidian_path=getattr(note_model, "obsidian_path", None),
        )

    @staticmethod
    def _note_to_model(note: Note) -> NoteModel:
        """Convert Pydantic model to SQLAlchemy model."""
        return NoteModel(
            id=note.id,
            widget_id=note.widget_id,
            title=note.title,
            content=note.content,
            labels=note.labels,
            created_at=note.created_at,
            updated_at=note.updated_at,
            x=note.x,
            y=note.y,
            width=note.width,
            height=note.height,
            source=note.source,
            obsidian_path=note.obsidian_path,
        )

    @staticmethod
    def _update_model_from_note(model: NoteModel, note: Note) -> None:
        """Update SQLAlchemy model from Pydantic model."""
        model.widget_id = note.widget_id
        model.title = note.title
        model.content = note.content
        model.labels = note.labels
        model.updated_at = note.updated_at
        model.x = note.x
        model.y = note.y
        model.width = note.width
        model.height = note.height
        model.source = note.source
        model.obsidian_path = note.obsidian_path
