"""Integration tests for the notes service components."""

import asyncio
import uuid
from datetime import datetime, timezone
from typing import Any
from unittest.mock import AsyncMock, patch

import pytest
from src.models import Note
from src.obsidian_service import ObsidianService
from src.service import NoteService


class TestNotesIntegration:
    """Integration test cases for notes service components."""

    @pytest.fixture
    def service(self):
        """Create a NoteService instance for integration testing."""
        return NoteService()

    @pytest.fixture
    def sample_note_data(self) -> dict[str, Any]:
        """Sample note data for testing."""
        return {
            "widget_id": "integration-widget-123",
            "title": "Integration Test Note",
            "content": "This is integration test content",
            "labels": ["integration", "test"],
            "x": 100,
            "y": 200,
            "width": 400,
            "height": 300,
        }

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_note_lifecycle_full_flow(
        self, service: NoteService, sample_note_data: dict[str, Any]
    ) -> None:
        """Test complete note lifecycle: create, read, update, delete."""
        with patch.object(service, "repository") as mock_repo:
            created_note = Note(
                id=str(uuid.uuid4()),
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

            async def mock_save_note(note: Note) -> Note:
                return created_note

            async def mock_get_note_by_id(note_id: str) -> Note:
                return created_note

            async def mock_delete_note(note_id: str) -> bool:
                return True

            mock_repo.save_note.side_effect = mock_save_note
            mock_repo.get_note_by_id.side_effect = mock_get_note_by_id
            mock_repo.delete_note.side_effect = mock_delete_note

            note = await service.create_note(**sample_note_data)
            assert note.title == sample_note_data["title"]
            assert note.content == sample_note_data["content"]
            assert note.labels == sample_note_data["labels"]

            retrieved_note = await service.get_note_by_id(note.id)
            assert retrieved_note is not None
            assert retrieved_note.id == note.id
            assert retrieved_note.title == note.title

            updated_title = "Updated Integration Test Note"
            updated_content = "Updated integration test content"
            updated_note = Note(
                id=note.id,
                widget_id=note.widget_id,
                title=updated_title,
                content=updated_content,
                labels=note.labels,
                created_at=note.created_at,
                updated_at=datetime.now(timezone.utc),
                x=note.x,
                y=note.y,
                width=note.width,
                height=note.height,
            )
            mock_repo.save_note.return_value = updated_note

            result = await service.update_note(
                note.id, title=updated_title, content=updated_content
            )
            assert result.title == updated_title
            assert result.content == updated_content

            delete_result = await service.delete_note(note.id)
            assert delete_result is True

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_obsidian_sync_integration(
        self, service: NoteService, sample_note_data: dict[str, Any]
    ) -> None:
        """Test integration between note service and Obsidian service."""
        api_url = "http://localhost:27123"
        auth_key = "test-integration-key"

        mock_obsidian_service = AsyncMock(spec=ObsidianService)
        mock_obsidian_service.test_connection.return_value = True
        mock_obsidian_service.create_safe_filename.return_value = "integration-test.md"
        mock_obsidian_service.create_frontmatter.return_value = (
            '---\ntags: ["integration", "test"]\n---\n\n'
        )
        mock_obsidian_service.create_or_update_file.return_value = True
        mock_obsidian_service.delete_file.return_value = True

        with patch.object(service, "repository") as mock_repo:
            with patch(
                "src.service.ObsidianService", return_value=mock_obsidian_service
            ):
                created_note = Note(
                    id=str(
                        uuid.uuid5(uuid.NAMESPACE_DNS, "obsidian:integration-test.md")
                    ),
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
                    source="obsidian",
                    obsidian_path="integration-test.md",
                )

                async def mock_save_note(note: Note) -> Note:
                    return created_note

                async def mock_get_note_by_id(note_id: str) -> Note:
                    return created_note

                async def mock_delete_note(note_id: str) -> bool:
                    return True

                mock_repo.save_note.side_effect = mock_save_note
                mock_repo.get_note_by_id.side_effect = mock_get_note_by_id
                mock_repo.delete_note.side_effect = mock_delete_note

                note = await service.create_note_with_obsidian_sync(
                    obsidian_api_url=api_url,
                    obsidian_auth_key=auth_key,
                    **sample_note_data,
                )

                assert note.source == "obsidian"
                assert note.obsidian_path == "integration-test.md"
                mock_obsidian_service.create_or_update_file.assert_called_once()

                updated_title = "Updated Obsidian Note"
                updated_note = Note(
                    id=note.id,
                    widget_id=note.widget_id,
                    title=updated_title,
                    content=note.content,
                    labels=note.labels,
                    created_at=note.created_at,
                    updated_at=datetime.now(timezone.utc),
                    x=note.x,
                    y=note.y,
                    width=note.width,
                    height=note.height,
                    source="obsidian",
                    obsidian_path=note.obsidian_path,
                )
                mock_repo.save_note.return_value = updated_note

                result = await service.update_note_with_obsidian_sync(
                    note.id,
                    title=updated_title,
                    obsidian_api_url=api_url,
                    obsidian_auth_key=auth_key,
                )

                assert result.title == updated_title
                assert mock_obsidian_service.create_or_update_file.call_count == 2

                delete_result = await service.delete_note_with_obsidian_sync(
                    note.id,
                    obsidian_api_url=api_url,
                    obsidian_auth_key=auth_key,
                )

                assert delete_result is True
                mock_obsidian_service.delete_file.assert_called_once_with(
                    "integration-test.md"
                )

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_vault_sync_integration(self, service: NoteService) -> None:
        """Test integration of vault synchronization."""
        widget_id = "sync-widget-123"
        api_url = "http://localhost:27123"
        auth_key = "test-sync-key"

        mock_obsidian_service = AsyncMock(spec=ObsidianService)
        mock_obsidian_service.test_connection.return_value = True

        obsidian_notes = [
            Note(
                id=str(uuid.uuid5(uuid.NAMESPACE_DNS, "obsidian:note1.md")),
                widget_id=widget_id,
                title="Vault Note 1",
                content="Content from vault note 1",
                labels=["vault", "sync"],
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
                source="obsidian",
                obsidian_path="note1.md",
            ),
            Note(
                id=str(uuid.uuid5(uuid.NAMESPACE_DNS, "obsidian:note2.md")),
                widget_id=widget_id,
                title="Vault Note 2",
                content="Content from vault note 2",
                labels=["vault", "test"],
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
                source="obsidian",
                obsidian_path="note2.md",
            ),
        ]

        mock_obsidian_service.sync_vault_to_notes.return_value = obsidian_notes

        with patch.object(service, "repository") as mock_repo:
            with patch(
                "src.service.ObsidianService", return_value=mock_obsidian_service
            ):

                async def mock_get_note_by_id(note_id: str) -> Note | None:
                    return None

                async def mock_get_note_by_obsidian_path(
                    obsidian_path: str,
                ) -> Note | None:
                    return None

                async def mock_get_note_by_title_and_widget(
                    title: str, widget_id: str
                ) -> Note | None:
                    return None

                async def mock_save_note(note: Note) -> Note:
                    return note

                mock_repo.get_note_by_id.side_effect = mock_get_note_by_id
                mock_repo.get_note_by_obsidian_path.side_effect = (
                    mock_get_note_by_obsidian_path
                )
                mock_repo.get_note_by_title_and_widget.side_effect = (
                    mock_get_note_by_title_and_widget
                )
                mock_repo.save_note.side_effect = mock_save_note

                synced_notes = await service.sync_obsidian_vault(
                    widget_id, api_url, auth_key
                )

                assert len(synced_notes) == 2
                assert all(note.source == "obsidian" for note in synced_notes)
                assert all(note.widget_id == widget_id for note in synced_notes)

                assert mock_repo.save_note.call_count == 2
                mock_obsidian_service.test_connection.assert_called_once()
                mock_obsidian_service.sync_vault_to_notes.assert_called_once_with(
                    widget_id
                )

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_error_handling_integration(
        self, service: NoteService, sample_note_data: dict[str, Any]
    ) -> None:
        """Test error handling across service components."""
        with patch.object(service, "repository") as mock_repo:
            mock_repo.save_note.side_effect = Exception("Database connection failed")

            with pytest.raises(Exception, match="Database connection failed"):
                await service.create_note(**sample_note_data)

        api_url = "http://localhost:27123"
        auth_key = "test-error-key"

        mock_obsidian_service = AsyncMock(spec=ObsidianService)
        mock_obsidian_service.test_connection.return_value = False

        with patch("src.service.ObsidianService", return_value=mock_obsidian_service):
            with pytest.raises(ValueError, match="Cannot connect to Obsidian API"):
                await service.sync_obsidian_vault("widget-id", api_url, auth_key)

        with patch.object(service, "repository") as mock_repo:

            async def mock_get_note_by_id(note_id: str) -> Note | None:
                return None

            mock_repo.get_note_by_id.side_effect = mock_get_note_by_id

            with pytest.raises(ValueError, match="Note with ID non-existent not found"):
                await service.update_note("non-existent", title="New Title")

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_concurrent_operations_integration(
        self, service: NoteService, sample_note_data: dict[str, Any]
    ) -> None:
        """Test handling of concurrent operations."""
        with patch.object(service, "repository") as mock_repo:
            notes: list[Note] = []
            for i in range(3):
                note_data = sample_note_data.copy()
                note_data["title"] = f"Concurrent Note {i}"

                created_note = Note(
                    id=str(uuid.uuid4()),
                    widget_id=note_data["widget_id"],
                    title=note_data["title"],
                    content=note_data["content"],
                    labels=note_data["labels"],
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc),
                    x=note_data["x"],
                    y=note_data["y"],
                    width=note_data["width"],
                    height=note_data["height"],
                )
                notes.append(created_note)

            note_index = 0

            async def mock_save_note(note: Note) -> Note:
                nonlocal note_index
                result = notes[note_index % len(notes)]
                note_index += 1
                return result

            mock_repo.save_note.side_effect = mock_save_note

            tasks: list[asyncio.Task[Note]] = []
            for i in range(3):
                note_data = sample_note_data.copy()
                note_data["title"] = f"Concurrent Note {i}"
                tasks.append(asyncio.create_task(service.create_note(**note_data)))

            results = await asyncio.gather(*tasks)

            assert len(results) == 3
            assert all(isinstance(note, Note) for note in results)
            assert mock_repo.save_note.call_count == 3
