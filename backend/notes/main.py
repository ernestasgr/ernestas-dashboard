import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List, Optional

import strawberry
from fastapi import FastAPI
from pydantic import BaseModel
from sqlalchemy import (
    ARRAY,
    DateTime,
    Integer,
    String,
    Text,
    delete,
    select,
)
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from strawberry.fastapi import GraphQLRouter
from strawberry.federation import Schema

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:password@notes-db:5432/personal_dashboard_notes",
)

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


class NoteModel(Base):
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


class Note(BaseModel):
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


async def create_tables():
    """Create the notes table if it doesn't exist"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_notes_from_db(
    widget_id: str, label_filter: Optional[List[str]] = None
) -> List[Note]:
    """Get notes from database for a specific widget"""
    async with AsyncSessionLocal() as session:
        if label_filter:
            # Use PostgreSQL array overlap operator
            query = (
                select(NoteModel)
                .where(
                    NoteModel.widget_id == widget_id,
                    NoteModel.labels.overlap(label_filter),
                )
                .order_by(NoteModel.updated_at.desc())
            )
        else:
            query = (
                select(NoteModel)
                .where(NoteModel.widget_id == widget_id)
                .order_by(NoteModel.updated_at.desc())
            )

        result = await session.execute(query)
        note_models = result.scalars().all()

        return [
            Note(
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
            )
            for note_model in note_models
        ]


async def get_note_from_db(note_id: str) -> Optional[Note]:
    """Get a single note from database"""
    async with AsyncSessionLocal() as session:
        query = select(NoteModel).where(NoteModel.id == note_id)
        result = await session.execute(query)
        note_model = result.scalar_one_or_none()

        if not note_model:
            return None

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
        )


async def save_note_to_db(note: Note) -> Note:
    """Save note to database"""
    async with AsyncSessionLocal() as session:
        existing_note = await session.get(NoteModel, note.id)

        if existing_note:
            existing_note.widget_id = note.widget_id
            existing_note.title = note.title
            existing_note.content = note.content
            existing_note.labels = note.labels
            existing_note.updated_at = note.updated_at
            existing_note.x = note.x
            existing_note.y = note.y
            existing_note.width = note.width
            existing_note.height = note.height
        else:
            note_model = NoteModel(
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
            )
            session.add(note_model)

        await session.commit()
        return note


async def delete_note_from_db(note_id: str) -> bool:
    """Delete note from database"""
    async with AsyncSessionLocal() as session:
        query = delete(NoteModel).where(NoteModel.id == note_id)
        result = await session.execute(query)
        await session.commit()
        return result.rowcount > 0


@strawberry.federation.type(keys=["id"])
class NoteType:
    id: strawberry.ID
    widget_id: strawberry.ID
    title: str
    content: str
    labels: List[str]
    created_at: datetime
    updated_at: datetime
    x: Optional[int] = None
    y: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None


@strawberry.input
class CreateNoteInput:
    widget_id: strawberry.ID
    title: str
    content: str
    labels: List[str] = strawberry.field(default_factory=list)
    x: Optional[int] = None
    y: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None


@strawberry.input
class UpdateNoteInput:
    id: strawberry.ID
    title: Optional[str] = None
    content: Optional[str] = None
    labels: Optional[List[str]] = None
    x: Optional[int] = None
    y: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None


@strawberry.input
class UpdateNoteLayoutInput:
    id: strawberry.ID
    x: int
    y: int
    width: int
    height: int


@strawberry.input
class NotesFilterInput:
    widget_id: strawberry.ID
    labels: Optional[List[str]] = None


@strawberry.type
class Query:
    @strawberry.field
    async def notes(self, filter: NotesFilterInput) -> List[NoteType]:
        """Get notes for a widget, optionally filtered by labels"""
        notes = await get_notes_from_db(filter.widget_id, filter.labels)

        return [
            NoteType(
                id=strawberry.ID(note.id),
                widget_id=strawberry.ID(note.widget_id),
                title=note.title,
                content=note.content,
                labels=note.labels,
                created_at=note.created_at,
                updated_at=note.updated_at,
                x=note.x,
                y=note.y,
                width=note.width,
                height=note.height,
            )
            for note in notes
        ]

    @strawberry.field
    async def note(self, id: strawberry.ID) -> Optional[NoteType]:
        """Get a specific note by ID"""
        note = await get_note_from_db(id)
        if not note:
            return None

        return NoteType(
            id=strawberry.ID(note.id),
            widget_id=strawberry.ID(note.widget_id),
            title=note.title,
            content=note.content,
            labels=note.labels,
            created_at=note.created_at,
            updated_at=note.updated_at,
            x=note.x,
            y=note.y,
            width=note.width,
            height=note.height,
        )


@strawberry.type
class Mutation:
    @strawberry.field
    async def create_note(self, input: CreateNoteInput) -> NoteType:
        """Create a new note"""
        note_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)

        note = Note(
            id=note_id,
            widget_id=input.widget_id,
            title=input.title,
            content=input.content,
            labels=input.labels or [],
            created_at=now,
            updated_at=now,
            x=input.x,
            y=input.y,
            width=input.width,
            height=input.height,
        )

        saved_note = await save_note_to_db(note)

        return NoteType(
            id=strawberry.ID(saved_note.id),
            widget_id=strawberry.ID(saved_note.widget_id),
            title=saved_note.title,
            content=saved_note.content,
            labels=saved_note.labels,
            created_at=saved_note.created_at,
            updated_at=saved_note.updated_at,
            x=saved_note.x,
            y=saved_note.y,
            width=saved_note.width,
            height=saved_note.height,
        )

    @strawberry.field
    async def update_note(self, input: UpdateNoteInput) -> NoteType:
        """Update an existing note"""
        note = await get_note_from_db(input.id)
        if not note:
            raise ValueError(f"Note with ID {input.id} not found")

        if input.title is not None:
            note.title = input.title
        if input.content is not None:
            note.content = input.content
        if input.labels is not None:
            note.labels = input.labels
        if input.x is not None:
            note.x = input.x
        if input.y is not None:
            note.y = input.y
        if input.width is not None:
            note.width = input.width
        if input.height is not None:
            note.height = input.height

        note.updated_at = datetime.now(timezone.utc)
        saved_note = await save_note_to_db(note)

        return NoteType(
            id=strawberry.ID(saved_note.id),
            widget_id=strawberry.ID(saved_note.widget_id),
            title=saved_note.title,
            content=saved_note.content,
            labels=saved_note.labels,
            created_at=saved_note.created_at,
            updated_at=saved_note.updated_at,
            x=saved_note.x,
            y=saved_note.y,
            width=saved_note.width,
            height=saved_note.height,
        )

    @strawberry.field
    async def update_note_layout(self, input: UpdateNoteLayoutInput) -> NoteType:
        """Update note layout properties"""
        note = await get_note_from_db(input.id)
        if not note:
            raise ValueError(f"Note with ID {input.id} not found")

        note.x = input.x
        note.y = input.y
        note.width = input.width
        note.height = input.height
        note.updated_at = datetime.now(timezone.utc)

        saved_note = await save_note_to_db(note)

        return NoteType(
            id=strawberry.ID(saved_note.id),
            widget_id=strawberry.ID(saved_note.widget_id),
            title=saved_note.title,
            content=saved_note.content,
            labels=saved_note.labels,
            created_at=saved_note.created_at,
            updated_at=saved_note.updated_at,
            x=saved_note.x,
            y=saved_note.y,
            width=saved_note.width,
            height=saved_note.height,
        )

    @strawberry.field
    async def delete_note(self, id: strawberry.ID) -> bool:
        """Delete a note"""
        return await delete_note_from_db(id)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield
    pass


schema = Schema(query=Query, mutation=Mutation, enable_federation_2=True)

app = FastAPI(lifespan=lifespan)

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")


@app.get("/")
def read_root():
    return {"message": "Notes Service", "graphql_endpoint": "/graphql"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
