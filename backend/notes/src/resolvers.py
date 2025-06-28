"""GraphQL resolvers for the notes service."""

from typing import List, Optional

import strawberry
from fastapi import HTTPException

from .models import Note
from .schema import (
    CreateNoteInput,
    CreateNoteWithObsidianSyncInput,
    CreateOrUpdateObsidianFileInput,
    DeleteNoteWithObsidianSyncInput,
    NotesFilterInput,
    NoteType,
    ObsidianSyncInput,
    ObsidianTestConnectionInput,
    UpdateNoteInput,
    UpdateNoteLayoutInput,
    UpdateNoteWithObsidianSyncInput,
)
from .service import NoteService


def note_to_graphql_type(note: Note) -> NoteType:
    """Convert a Note model to GraphQL type."""
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
        source=note.source,
        obsidian_path=note.obsidian_path,
    )


@strawberry.type
class Query:
    """GraphQL query resolvers."""

    @strawberry.field
    async def notes(self, filter: NotesFilterInput) -> List[NoteType]:
        """Get notes for a widget, optionally filtered by labels."""
        service = NoteService()
        notes = await service.get_notes_by_widget(filter.widget_id, filter.labels)
        return [note_to_graphql_type(note) for note in notes]

    @strawberry.field
    async def note(self, id: strawberry.ID) -> Optional[NoteType]:
        """Get a specific note by ID."""
        service = NoteService()
        note = await service.get_note_by_id(id)

        if not note:
            return None

        return note_to_graphql_type(note)


@strawberry.type
class Mutation:
    """GraphQL mutation resolvers."""

    @strawberry.field
    async def create_note(self, input: CreateNoteInput) -> NoteType:
        """Create a new note."""
        service = NoteService()
        note = await service.create_note(
            widget_id=input.widget_id,
            title=input.title,
            content=input.content,
            labels=input.labels,
            x=input.x,
            y=input.y,
            width=input.width,
            height=input.height,
        )
        return note_to_graphql_type(note)

    @strawberry.field
    async def create_note_with_obsidian_sync(
        self, input: CreateNoteWithObsidianSyncInput
    ) -> NoteType:
        """Create a new note and optionally sync it to Obsidian."""
        service = NoteService()

        obsidian_api_url = input.obsidian_api_url if input.sync_to_obsidian else None
        obsidian_auth_key = input.obsidian_auth_key if input.sync_to_obsidian else None

        note = await service.create_note_with_obsidian_sync(
            widget_id=input.widget_id,
            title=input.title,
            content=input.content,
            labels=input.labels,
            x=input.x,
            y=input.y,
            width=input.width,
            height=input.height,
            obsidian_api_url=obsidian_api_url,
            obsidian_auth_key=obsidian_auth_key,
        )
        return note_to_graphql_type(note)

    @strawberry.field
    async def update_note(self, input: UpdateNoteInput) -> NoteType:
        """Update an existing note."""
        service = NoteService()
        try:
            note = await service.update_note(
                note_id=input.id,
                title=input.title,
                content=input.content,
                labels=input.labels,
                x=input.x,
                y=input.y,
                width=input.width,
                height=input.height,
            )
            return note_to_graphql_type(note)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

    @strawberry.field
    async def update_note_layout(self, input: UpdateNoteLayoutInput) -> NoteType:
        """Update note layout properties."""
        service = NoteService()
        try:
            note = await service.update_note_layout(
                note_id=input.id,
                x=input.x,
                y=input.y,
                width=input.width,
                height=input.height,
            )
            return note_to_graphql_type(note)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

    @strawberry.field
    async def update_note_with_obsidian_sync(
        self, input: UpdateNoteWithObsidianSyncInput
    ) -> NoteType:
        """Update a note and optionally sync it to Obsidian."""
        service = NoteService()

        obsidian_api_url = input.obsidian_api_url if input.sync_to_obsidian else None
        obsidian_auth_key = input.obsidian_auth_key if input.sync_to_obsidian else None

        try:
            note = await service.update_note_with_obsidian_sync(
                note_id=input.id,
                title=input.title,
                content=input.content,
                labels=input.labels,
                x=input.x,
                y=input.y,
                width=input.width,
                height=input.height,
                obsidian_api_url=obsidian_api_url,
                obsidian_auth_key=obsidian_auth_key,
            )
            return note_to_graphql_type(note)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

    @strawberry.field
    async def delete_note(self, id: strawberry.ID) -> bool:
        """Delete a note."""
        service = NoteService()
        return await service.delete_note(id)

    @strawberry.field
    async def delete_note_with_obsidian_sync(
        self, input: DeleteNoteWithObsidianSyncInput
    ) -> bool:
        """Delete a note and optionally delete it from Obsidian."""
        service = NoteService()

        obsidian_api_url = input.obsidian_api_url if input.sync_to_obsidian else None
        obsidian_auth_key = input.obsidian_auth_key if input.sync_to_obsidian else None

        try:
            return await service.delete_note_with_obsidian_sync(
                note_id=input.id,
                obsidian_api_url=obsidian_api_url,
                obsidian_auth_key=obsidian_auth_key,
            )
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

    @strawberry.field
    async def sync_obsidian_vault(self, input: ObsidianSyncInput) -> List[NoteType]:
        """Sync notes from Obsidian vault."""
        service = NoteService()
        try:
            notes = await service.sync_obsidian_vault(
                widget_id=input.widget_id,
                api_url=input.api_url,
                auth_key=input.auth_key,
            )
            return [note_to_graphql_type(note) for note in notes]
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    @strawberry.field
    async def test_obsidian_connection(
        self, input: ObsidianTestConnectionInput
    ) -> bool:
        """Test connection to Obsidian API."""
        service = NoteService()
        return await service.test_obsidian_connection(
            api_url=input.api_url,
            auth_key=input.auth_key,
        )

    @strawberry.field
    async def create_or_update_obsidian_file(
        self, input: CreateOrUpdateObsidianFileInput
    ) -> bool:
        """Create or update a file in Obsidian vault."""
        service = NoteService()
        return await service.create_or_update_obsidian_file(
            api_url=input.api_url,
            auth_key=input.auth_key,
            file_path=input.file_path,
            content=input.content,
        )
