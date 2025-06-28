"""Unit tests for the NoteService class."""

from datetime import datetime, timezone
from typing import Any
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest
from src.models import Note
from src.obsidian_service import ObsidianService
from src.service import NoteService


class TestNoteService:
    """Test cases for NoteService."""

    @pytest.fixture
    def service(self) -> NoteService:
        """Create a NoteService instance for testing."""
        return NoteService()

    @pytest.fixture
    def sample_note_data(self) -> dict[str, Any]:
        """Sample note data for testing."""
        return {
            "widget_id": "test-widget-123",
            "title": "Test Note",
            "content": "This is test content",
            "labels": ["test", "sample"],
            "x": 10,
            "y": 20,
            "width": 300,
            "height": 200,
        }

    @pytest.mark.asyncio
    async def test_get_notes_by_widget_success(
        self, service: NoteService, sample_note: Note
    ):
        """Test successful retrieval of notes by widget ID."""
        widget_id = "test-widget-123"
        expected_notes = [sample_note]

        with patch.object(
            service.repository, "get_notes_by_widget", return_value=expected_notes
        ) as mock_get:
            result = await service.get_notes_by_widget(widget_id)

            assert result == expected_notes
            mock_get.assert_called_once_with(widget_id, None)

    @pytest.mark.asyncio
    async def test_get_notes_by_widget_with_labels(
        self, service: NoteService, sample_note: Note
    ):
        """Test retrieval of notes by widget ID with label filter."""
        widget_id = "test-widget-123"
        label_filter = ["test"]
        expected_notes = [sample_note]

        with patch.object(
            service.repository, "get_notes_by_widget", return_value=expected_notes
        ) as mock_get:
            result = await service.get_notes_by_widget(widget_id, label_filter)

            assert result == expected_notes
            mock_get.assert_called_once_with(widget_id, label_filter)

    @pytest.mark.asyncio
    async def test_get_note_by_id_found(self, service: NoteService, sample_note: Note):
        """Test successful retrieval of note by ID."""
        note_id = "test-note-123"

        with patch.object(
            service.repository, "get_note_by_id", return_value=sample_note
        ) as mock_get:
            result = await service.get_note_by_id(note_id)

            assert result == sample_note
            mock_get.assert_called_once_with(note_id)

    @pytest.mark.asyncio
    async def test_get_note_by_id_not_found(self, service: NoteService):
        """Test retrieval of non-existent note by ID."""
        note_id = "non-existent-id"

        with patch.object(
            service.repository, "get_note_by_id", return_value=None
        ) as mock_get:
            result = await service.get_note_by_id(note_id)

            assert result is None
            mock_get.assert_called_once_with(note_id)

    @pytest.mark.asyncio
    async def test_create_note_success(
        self, service: NoteService, sample_note_data: dict[str, Any]
    ):
        """Test successful note creation."""
        expected_note = Note(
            id="generated-id",
            widget_id=sample_note_data["widget_id"],
            title=sample_note_data["title"],
            content=sample_note_data["content"],
            labels=sample_note_data["labels"],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            x=sample_note_data["x"],
            y=sample_note_data["y"],
            width=sample_note_data["width"],
            height=sample_note_data["height"],
        )

        with patch.object(
            service.repository, "save_note", return_value=expected_note
        ) as mock_save:
            with patch("src.service.uuid.uuid4", return_value=uuid4()) as mock_uuid:
                result = await service.create_note(**sample_note_data)

                assert result == expected_note
                mock_save.assert_called_once()
                mock_uuid.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_note_with_defaults(self, service: NoteService):
        """Test note creation with default values."""
        widget_id = "test-widget"
        title = "Test Note"
        content = "Test content"

        with patch.object(service.repository, "save_note") as mock_save:
            mock_save.return_value = Note(
                id="test-id",
                widget_id=widget_id,
                title=title,
                content=content,
                labels=[],
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )

            result = await service.create_note(widget_id, title, content)

            assert result.widget_id == widget_id
            assert result.title == title
            assert result.content == content
            assert result.labels == []
            assert result.x is None
            assert result.y is None
            assert result.width is None
            assert result.height is None
            mock_save.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_note_success(self, service: NoteService, sample_note: Note):
        """Test successful note update."""
        note_id = "test-note-123"
        new_title = "Updated Title"
        new_content = "Updated content"

        with patch.object(
            service.repository, "get_note_by_id", return_value=sample_note
        ) as mock_get:
            with patch.object(
                service.repository, "save_note", return_value=sample_note
            ) as mock_save:
                result = await service.update_note(
                    note_id, title=new_title, content=new_content
                )

                assert result.title == new_title
                assert result.content == new_content
                mock_get.assert_called_once_with(note_id)
                mock_save.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_note_not_found(self, service: NoteService):
        """Test update of non-existent note."""
        note_id = "non-existent-id"

        with patch.object(
            service.repository, "get_note_by_id", return_value=None
        ) as mock_get:
            with pytest.raises(ValueError, match=f"Note with ID {note_id} not found"):
                await service.update_note(note_id, title="New Title")

            mock_get.assert_called_once_with(note_id)

    @pytest.mark.asyncio
    async def test_update_note_layout_success(
        self, service: NoteService, sample_note: Note
    ):
        """Test successful note layout update."""
        note_id = "test-note-123"
        new_x, new_y, new_width, new_height = 100, 200, 400, 300

        with patch.object(
            service.repository, "get_note_by_id", return_value=sample_note
        ) as mock_get:
            with patch.object(
                service.repository, "save_note", return_value=sample_note
            ) as mock_save:
                result = await service.update_note_layout(
                    note_id, new_x, new_y, new_width, new_height
                )

                assert result.x == new_x
                assert result.y == new_y
                assert result.width == new_width
                assert result.height == new_height
                mock_get.assert_called_once_with(note_id)
                mock_save.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_note_success(self, service: NoteService):
        """Test successful note deletion."""
        note_id = "test-note-123"

        with patch.object(
            service.repository, "delete_note", return_value=True
        ) as mock_delete:
            result = await service.delete_note(note_id)

            assert result is True
            mock_delete.assert_called_once_with(note_id)

    @pytest.mark.asyncio
    async def test_delete_note_not_found(self, service: NoteService):
        """Test deletion of non-existent note."""
        note_id = "non-existent-id"

        with patch.object(
            service.repository, "delete_note", return_value=False
        ) as mock_delete:
            result = await service.delete_note(note_id)

            assert result is False
            mock_delete.assert_called_once_with(note_id)

    @pytest.mark.asyncio
    async def test_create_note_with_obsidian_sync_disabled(
        self, service: NoteService, sample_note_data: dict[str, Any]
    ):
        """Test creating note without Obsidian sync."""
        expected_note = Note(
            id="test-id",
            widget_id=sample_note_data["widget_id"],
            title=sample_note_data["title"],
            content=sample_note_data["content"],
            labels=sample_note_data["labels"],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            x=sample_note_data["x"],
            y=sample_note_data["y"],
            width=sample_note_data["width"],
            height=sample_note_data["height"],
        )

        with patch.object(
            service, "create_note", return_value=expected_note
        ) as mock_create:
            result = await service.create_note_with_obsidian_sync(**sample_note_data)

            assert result == expected_note
            mock_create.assert_called_once_with(
                sample_note_data["widget_id"],
                sample_note_data["title"],
                sample_note_data["content"],
                sample_note_data["labels"],
                sample_note_data["x"],
                sample_note_data["y"],
                sample_note_data["width"],
                sample_note_data["height"],
            )

    @pytest.mark.asyncio
    async def test_create_note_with_obsidian_sync_enabled(
        self, service: NoteService, sample_note_data: dict[str, Any]
    ):
        """Test creating note with Obsidian sync enabled."""
        api_url = "http://localhost:27123"
        auth_key = "test-key"
        note = Note(
            id="test-id",
            widget_id=sample_note_data["widget_id"],
            title=sample_note_data["title"],
            content=sample_note_data["content"],
            labels=sample_note_data["labels"],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            x=sample_note_data["x"],
            y=sample_note_data["y"],
            width=sample_note_data["width"],
            height=sample_note_data["height"],
        )

        mock_obsidian_service = AsyncMock(spec=ObsidianService)
        mock_obsidian_service.create_safe_filename.return_value = "test-note.md"
        mock_obsidian_service.create_frontmatter.return_value = (
            '---\ntags: ["test"]\n---\n\n'
        )
        mock_obsidian_service.create_or_update_file.return_value = True

        with patch.object(service, "create_note", return_value=note) as mock_create:
            with patch.object(service.repository, "delete_note"):
                with patch.object(service.repository, "save_note", return_value=note):
                    with patch(
                        "src.service.ObsidianService",
                        return_value=mock_obsidian_service,
                    ):
                        result = await service.create_note_with_obsidian_sync(
                            obsidian_api_url=api_url,
                            obsidian_auth_key=auth_key,
                            **sample_note_data,
                        )

                        assert result == note
                        mock_create.assert_called_once()
                        mock_obsidian_service.create_or_update_file.assert_called_once()

    @pytest.mark.asyncio
    async def test_test_obsidian_connection_success(self, service: NoteService):
        """Test successful Obsidian connection test."""
        api_url = "http://localhost:27123"
        auth_key = "test-key"

        mock_obsidian_service = AsyncMock(spec=ObsidianService)
        mock_obsidian_service.test_connection.return_value = True

        with patch("src.service.ObsidianService", return_value=mock_obsidian_service):
            result = await service.test_obsidian_connection(api_url, auth_key)

            assert result is True
            mock_obsidian_service.test_connection.assert_called_once()

    @pytest.mark.asyncio
    async def test_test_obsidian_connection_failure(self, service: NoteService):
        """Test failed Obsidian connection test."""
        api_url = "http://localhost:27123"
        auth_key = "test-key"

        mock_obsidian_service = AsyncMock(spec=ObsidianService)
        mock_obsidian_service.test_connection.return_value = False

        with patch("src.service.ObsidianService", return_value=mock_obsidian_service):
            result = await service.test_obsidian_connection(api_url, auth_key)

            assert result is False
            mock_obsidian_service.test_connection.assert_called_once()

    @pytest.mark.asyncio
    async def test_sync_obsidian_vault_connection_failure(self, service: NoteService):
        """Test sync vault with connection failure."""
        widget_id = "test-widget"
        api_url = "http://localhost:27123"
        auth_key = "test-key"

        mock_obsidian_service = AsyncMock(spec=ObsidianService)
        mock_obsidian_service.test_connection.return_value = False

        with patch("src.service.ObsidianService", return_value=mock_obsidian_service):
            with pytest.raises(ValueError, match="Cannot connect to Obsidian API"):
                await service.sync_obsidian_vault(widget_id, api_url, auth_key)

    @pytest.mark.asyncio
    async def test_sync_obsidian_vault_success(
        self, service: NoteService, obsidian_note: Note
    ):
        """Test successful Obsidian vault sync."""
        widget_id = "test-widget"
        api_url = "http://localhost:27123"
        auth_key = "test-key"
        obsidian_notes = [obsidian_note]

        mock_obsidian_service = AsyncMock(spec=ObsidianService)
        mock_obsidian_service.test_connection.return_value = True
        mock_obsidian_service.sync_vault_to_notes.return_value = obsidian_notes

        with patch("src.service.ObsidianService", return_value=mock_obsidian_service):
            with patch.object(service.repository, "get_note_by_id", return_value=None):
                with patch.object(
                    service.repository, "get_note_by_obsidian_path", return_value=None
                ):
                    with patch.object(
                        service.repository,
                        "get_note_by_title_and_widget",
                        return_value=None,
                    ):
                        with patch.object(
                            service.repository, "save_note", return_value=obsidian_note
                        ) as mock_save:
                            result = await service.sync_obsidian_vault(
                                widget_id, api_url, auth_key
                            )

                            assert result == obsidian_notes
                            mock_obsidian_service.test_connection.assert_called_once()
                            mock_obsidian_service.sync_vault_to_notes.assert_called_once_with(
                                widget_id
                            )
                            mock_save.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_note_with_obsidian_sync_not_found(self, service: NoteService):
        """Test delete note with Obsidian sync when note doesn't exist."""
        note_id = "non-existent-id"
        api_url = "http://localhost:27123"
        auth_key = "test-key"

        with patch.object(service.repository, "get_note_by_id", return_value=None):
            with pytest.raises(ValueError, match=f"Note with ID {note_id} not found"):
                await service.delete_note_with_obsidian_sync(note_id, api_url, auth_key)

    @pytest.mark.asyncio
    async def test_delete_note_with_obsidian_sync_success(
        self, service: NoteService, obsidian_note: Note
    ):
        """Test successful delete note with Obsidian sync."""
        note_id = "obsidian-note-id"
        api_url = "http://localhost:27123"
        auth_key = "test-key"

        mock_obsidian_service = AsyncMock(spec=ObsidianService)
        mock_obsidian_service.delete_file.return_value = True

        with patch.object(
            service.repository, "get_note_by_id", return_value=obsidian_note
        ):
            with patch.object(
                service.repository, "delete_note", return_value=True
            ) as mock_delete:
                with patch(
                    "src.service.ObsidianService", return_value=mock_obsidian_service
                ):
                    result = await service.delete_note_with_obsidian_sync(
                        note_id, api_url, auth_key
                    )

                    assert result is True
                    mock_obsidian_service.delete_file.assert_called_once_with(
                        obsidian_note.obsidian_path
                    )
                    mock_delete.assert_called_once_with(note_id)

    @pytest.mark.asyncio
    async def test_create_or_update_obsidian_file_success(self, service: NoteService):
        """Test successful create/update of Obsidian file."""
        api_url = "http://localhost:27123"
        auth_key = "test-key"
        file_path = "test-note.md"
        content = "Test content"

        mock_obsidian_service = AsyncMock(spec=ObsidianService)
        mock_obsidian_service.create_or_update_file.return_value = True

        with patch("src.service.ObsidianService", return_value=mock_obsidian_service):
            result = await service.create_or_update_obsidian_file(
                api_url, auth_key, file_path, content
            )

            assert result is True
            mock_obsidian_service.create_or_update_file.assert_called_once_with(
                file_path, content
            )
