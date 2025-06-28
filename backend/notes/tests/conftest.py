"""Fixtures and configuration for pytest tests."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock

import pytest
from src.models import Note
from src.obsidian_service import ObsidianService
from src.repository import NoteRepository
from src.service import NoteService


@pytest.fixture
def sample_note():
    """Create a sample note for testing."""
    return Note(
        id="test-note-id",
        widget_id="test-widget-id",
        title="Test Note",
        content="This is test content",
        labels=["test", "sample"],
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        x=10,
        y=20,
        width=300,
        height=200,
        source="local",
        obsidian_path=None,
    )


@pytest.fixture
def obsidian_note():
    """Create a sample Obsidian note for testing."""
    return Note(
        id="obsidian-note-id",
        widget_id="test-widget-id",
        title="Obsidian Note",
        content="This is Obsidian content",
        labels=["obsidian", "sync"],
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        x=50,
        y=60,
        width=400,
        height=250,
        source="obsidian",
        obsidian_path="test-note.md",
    )


@pytest.fixture
def mock_repository():
    """Create a mock repository for testing."""
    mock_repo = AsyncMock(spec=NoteRepository)
    return mock_repo


@pytest.fixture
def mock_obsidian_service():
    """Create a mock Obsidian service for testing."""
    mock_service = AsyncMock(spec=ObsidianService)
    mock_service.test_connection.return_value = True
    mock_service.create_or_update_file.return_value = True
    mock_service.delete_file.return_value = True
    mock_service.create_safe_filename.return_value = "test-file.md"
    mock_service.create_frontmatter.return_value = '---\ntags: ["test"]\n---\n\n'
    return mock_service


@pytest.fixture
def mock_note_service_with_mocks(
    mock_repository: AsyncMock, monkeypatch: pytest.MonkeyPatch
):
    """Create a NoteService with mocked dependencies."""
    service = NoteService()
    monkeypatch.setattr(service, "repository", mock_repository)
    return service
