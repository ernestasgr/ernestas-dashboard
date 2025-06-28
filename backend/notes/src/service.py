"""Business logic service for note operations."""

import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from .models import Note
from .obsidian_service import ObsidianService
from .repository import NoteRepository

logger = logging.getLogger(__name__)


class NoteService:
    """Service layer for note business logic."""

    def __init__(self):
        self.repository = NoteRepository()

    async def get_notes_by_widget(
        self, widget_id: str, label_filter: Optional[List[str]] = None
    ) -> List[Note]:
        """Get notes for a widget, optionally filtered by labels."""
        return await self.repository.get_notes_by_widget(widget_id, label_filter)

    async def get_note_by_id(self, note_id: str) -> Optional[Note]:
        """Get a specific note by ID."""
        return await self.repository.get_note_by_id(note_id)

    async def get_note_by_title_and_widget(
        self, title: str, widget_id: str
    ) -> Optional[Note]:
        """Get a note by title and widget ID."""
        return await self.repository.get_note_by_title_and_widget(title, widget_id)

    async def get_note_by_obsidian_path(self, obsidian_path: str) -> Optional[Note]:
        """Get a note by its Obsidian path."""
        return await self.repository.get_note_by_obsidian_path(obsidian_path)

    async def create_note(
        self,
        widget_id: str,
        title: str,
        content: str,
        labels: Optional[List[str]] = None,
        x: Optional[int] = None,
        y: Optional[int] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
    ) -> Note:
        """Create a new note."""
        note_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)

        note = Note(
            id=note_id,
            widget_id=widget_id,
            title=title,
            content=content,
            labels=labels or [],
            created_at=now,
            updated_at=now,
            x=x,
            y=y,
            width=width,
            height=height,
        )

        return await self.repository.save_note(note)

    async def create_note_with_obsidian_sync(
        self,
        widget_id: str,
        title: str,
        content: str,
        labels: Optional[List[str]] = None,
        x: Optional[int] = None,
        y: Optional[int] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
        obsidian_api_url: Optional[str] = None,
        obsidian_auth_key: Optional[str] = None,
    ) -> Note:
        """Create a new note and optionally sync it to Obsidian."""
        note = await self.create_note(
            widget_id, title, content, labels, x, y, width, height
        )

        if obsidian_api_url and obsidian_auth_key:
            try:
                obsidian_service = ObsidianService(obsidian_api_url, obsidian_auth_key)

                file_path = obsidian_service.create_safe_filename(note.title)
                frontmatter = obsidian_service.create_frontmatter(note.labels)
                content_with_frontmatter = frontmatter + note.content

                success = await obsidian_service.create_or_update_file(
                    file_path, content_with_frontmatter
                )

                if success:
                    obsidian_id = str(
                        uuid.uuid5(uuid.NAMESPACE_DNS, f"obsidian:{file_path}")
                    )

                    await self.repository.delete_note(note.id)

                    note.id = obsidian_id
                    note.source = "obsidian"
                    note.obsidian_path = file_path
                    note = await self.repository.save_note(note)
                    logger.info(
                        f"Successfully created and synced note {note.id} to Obsidian at {file_path}"
                    )
                else:
                    logger.warning(f"Failed to sync note {note.id} to Obsidian")

            except Exception as e:
                logger.error(f"Error syncing note {note.id} to Obsidian: {str(e)}")

        return note

    async def update_note(
        self,
        note_id: str,
        title: Optional[str] = None,
        content: Optional[str] = None,
        labels: Optional[List[str]] = None,
        x: Optional[int] = None,
        y: Optional[int] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
    ) -> Note:
        """Update an existing note."""
        note = await self.repository.get_note_by_id(note_id)
        if not note:
            raise ValueError(f"Note with ID {note_id} not found")

        if title is not None:
            note.title = title
        if content is not None:
            note.content = content
        if labels is not None:
            note.labels = labels
        if x is not None:
            note.x = x
        if y is not None:
            note.y = y
        if width is not None:
            note.width = width
        if height is not None:
            note.height = height

        note.updated_at = datetime.now(timezone.utc)
        return await self.repository.save_note(note)

    async def update_note_with_obsidian_sync(
        self,
        note_id: str,
        title: Optional[str] = None,
        content: Optional[str] = None,
        labels: Optional[List[str]] = None,
        x: Optional[int] = None,
        y: Optional[int] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
        obsidian_api_url: Optional[str] = None,
        obsidian_auth_key: Optional[str] = None,
    ) -> Note:
        """Update a note and optionally sync it to Obsidian."""
        note = await self.update_note(
            note_id, title, content, labels, x, y, width, height
        )

        if obsidian_api_url and obsidian_auth_key:
            try:
                obsidian_service = ObsidianService(obsidian_api_url, obsidian_auth_key)

                if note.source == "obsidian" and note.obsidian_path:
                    file_path = note.obsidian_path
                else:
                    file_path = obsidian_service.create_safe_filename(note.title)

                    obsidian_id = str(
                        uuid.uuid5(uuid.NAMESPACE_DNS, f"obsidian:{file_path}")
                    )

                    await self.repository.delete_note(note.id)

                    note.id = obsidian_id
                    note.obsidian_path = file_path
                    note.source = "obsidian"

                frontmatter = obsidian_service.create_frontmatter(note.labels)
                content_with_frontmatter = frontmatter + note.content

                success = await obsidian_service.create_or_update_file(
                    file_path, content_with_frontmatter
                )

                if success:
                    note = await self.repository.save_note(note)
                    logger.info(
                        f"Successfully synced note {note.id} to Obsidian at {file_path}"
                    )
                else:
                    logger.warning(f"Failed to sync note {note.id} to Obsidian")

            except Exception as e:
                logger.error(f"Error syncing note {note.id} to Obsidian: {str(e)}")

        return note

    async def update_note_layout(
        self, note_id: str, x: int, y: int, width: int, height: int
    ) -> Note:
        """Update note layout properties."""
        return await self.update_note(note_id, x=x, y=y, width=width, height=height)

    async def delete_note(self, note_id: str) -> bool:
        """Delete a note."""
        return await self.repository.delete_note(note_id)

    async def delete_note_with_obsidian_sync(
        self,
        note_id: str,
        obsidian_api_url: Optional[str] = None,
        obsidian_auth_key: Optional[str] = None,
    ) -> bool:
        """Delete a note and optionally delete it from Obsidian."""
        note = await self.repository.get_note_by_id(note_id)
        if not note:
            raise ValueError(f"Note with ID {note_id} not found")

        if (
            obsidian_api_url
            and obsidian_auth_key
            and note.source == "obsidian"
            and note.obsidian_path
        ):
            try:
                obsidian_service = ObsidianService(obsidian_api_url, obsidian_auth_key)

                success = await obsidian_service.delete_file(note.obsidian_path)

                if success:
                    logger.info(
                        f"Successfully deleted note {note.id} from Obsidian at {note.obsidian_path}"
                    )
                else:
                    logger.warning(f"Failed to delete note {note.id} from Obsidian")

            except Exception as e:
                logger.error(f"Error deleting note {note.id} from Obsidian: {str(e)}")

        return await self.repository.delete_note(note_id)

    async def sync_obsidian_vault(
        self, widget_id: str, api_url: str, auth_key: str
    ) -> List[Note]:
        """Sync notes from Obsidian vault."""
        obsidian_service = ObsidianService(api_url, auth_key)

        if not await obsidian_service.test_connection():
            raise ValueError(
                "Cannot connect to Obsidian API. Please ensure Obsidian Local REST API plugin is running and accessible."
            )

        obsidian_notes = await obsidian_service.sync_vault_to_notes(widget_id)

        saved_notes: List[Note] = []
        for note in obsidian_notes:
            try:
                existing_note = await self.repository.get_note_by_id(note.id)

                if not existing_note and note.obsidian_path:
                    existing_note = await self.repository.get_note_by_obsidian_path(
                        note.obsidian_path
                    )

                if not existing_note:
                    existing_note = await self.repository.get_note_by_title_and_widget(
                        note.title, widget_id
                    )

                if existing_note:
                    note.x = existing_note.x
                    note.y = existing_note.y
                    note.width = existing_note.width
                    note.height = existing_note.height
                    note.created_at = existing_note.created_at

                    if existing_note.id != note.id:
                        await self.repository.delete_note(existing_note.id)

                saved_note = await self.repository.save_note(note)
                saved_notes.append(saved_note)
                logger.info(f"Synced note {saved_note.id} from Obsidian")
            except Exception as e:
                logger.error(f"Failed to save Obsidian note {note.id}: {str(e)}")
                continue

        return saved_notes

    async def test_obsidian_connection(self, api_url: str, auth_key: str) -> bool:
        """Test connection to Obsidian API."""
        obsidian_service = ObsidianService(api_url, auth_key)
        return await obsidian_service.test_connection()

    async def create_or_update_obsidian_file(
        self, api_url: str, auth_key: str, file_path: str, content: str
    ) -> bool:
        """Create or update a file in Obsidian vault."""
        obsidian_service = ObsidianService(api_url, auth_key)
        return await obsidian_service.create_or_update_file(file_path, content)
