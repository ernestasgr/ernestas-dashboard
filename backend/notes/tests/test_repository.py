"""Unit tests for the NoteRepository class."""

from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest
from src.models import Note, NoteModel
from src.repository import NoteRepository


class TestNoteRepository:
    """Test cases for NoteRepository."""

    @pytest.fixture
    def sample_note(self):
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
    def sample_note_model(self):
        """Create a sample note model for testing."""
        model = MagicMock(spec=NoteModel)
        model.id = "test-note-id"
        model.widget_id = "test-widget-id"
        model.title = "Test Note"
        model.content = "This is test content"
        model.labels = ["test", "sample"]
        model.created_at = datetime.now(timezone.utc)
        model.updated_at = datetime.now(timezone.utc)
        model.x = 10
        model.y = 20
        model.width = 300
        model.height = 200
        model.source = "local"
        model.obsidian_path = None
        return model

    def test_model_to_note_conversion(self, sample_note_model: MagicMock):
        """Test conversion from SQLAlchemy model to Pydantic model."""
        result = NoteRepository._model_to_note(sample_note_model)  # type: ignore

        assert isinstance(result, Note)
        assert result.id == sample_note_model.id
        assert result.widget_id == sample_note_model.widget_id
        assert result.title == sample_note_model.title
        assert result.content == sample_note_model.content
        assert result.labels == sample_note_model.labels
        assert result.x == sample_note_model.x
        assert result.y == sample_note_model.y
        assert result.width == sample_note_model.width
        assert result.height == sample_note_model.height

    def test_note_to_model_conversion(self, sample_note: Note):
        """Test conversion from Pydantic model to SQLAlchemy model."""
        result = NoteRepository._note_to_model(sample_note)  # type: ignore

        assert isinstance(result, NoteModel)
        assert result.id == sample_note.id
        assert result.widget_id == sample_note.widget_id
        assert result.title == sample_note.title
        assert result.content == sample_note.content
        assert result.labels == sample_note.labels
        assert result.x == sample_note.x
        assert result.y == sample_note.y
        assert result.width == sample_note.width
        assert result.height == sample_note.height

    def test_update_model_from_note(
        self, sample_note: Note, sample_note_model: MagicMock
    ):
        """Test updating SQLAlchemy model from Pydantic model."""
        updated_title = "Updated Title"
        updated_content = "Updated content"
        sample_note.title = updated_title
        sample_note.content = updated_content

        NoteRepository._update_model_from_note(sample_note_model, sample_note)  # type: ignore

        assert sample_note_model.title == updated_title
        assert sample_note_model.content == updated_content
        assert sample_note_model.widget_id == sample_note.widget_id
        assert sample_note_model.labels == sample_note.labels

    @pytest.mark.asyncio
    async def test_get_notes_by_widget_without_filter_integration(self):
        """Test getting notes by widget ID without filter using method-level mocking."""
        widget_id = "test-widget-123"
        expected_notes = [
            Note(
                id="note1",
                widget_id=widget_id,
                title="Note 1",
                content="Content 1",
                labels=["test"],
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            ),
            Note(
                id="note2",
                widget_id=widget_id,
                title="Note 2",
                content="Content 2",
                labels=["sample"],
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            ),
        ]

        with patch.object(
            NoteRepository, "get_notes_by_widget", return_value=expected_notes
        ) as mock_method:
            result = await NoteRepository.get_notes_by_widget(widget_id)

            assert result == expected_notes
            assert len(result) == 2
            assert all(note.widget_id == widget_id for note in result)
            mock_method.assert_called_once_with(widget_id)

    @pytest.mark.asyncio
    async def test_get_notes_by_widget_with_filter_integration(self):
        """Test getting notes by widget ID with label filter using method-level mocking."""
        widget_id = "test-widget-123"
        label_filter = ["test"]
        expected_notes = [
            Note(
                id="note1",
                widget_id=widget_id,
                title="Note 1",
                content="Content 1",
                labels=["test"],
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
        ]

        with patch.object(
            NoteRepository, "get_notes_by_widget", return_value=expected_notes
        ) as mock_method:
            result = await NoteRepository.get_notes_by_widget(widget_id, label_filter)

            assert result == expected_notes
            assert len(result) == 1
            assert result[0].labels == ["test"]
            mock_method.assert_called_once_with(widget_id, label_filter)

    @pytest.mark.asyncio
    async def test_get_note_by_id_found_integration(self):
        """Test getting a note by ID when it exists using method-level mocking."""
        note_id = "test-note-123"
        expected_note = Note(
            id=note_id,
            widget_id="test-widget",
            title="Test Note",
            content="Test content",
            labels=["test"],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        with patch.object(
            NoteRepository, "get_note_by_id", return_value=expected_note
        ) as mock_method:
            result = await NoteRepository.get_note_by_id(note_id)

            assert result == expected_note
            assert result is not None and result.id == note_id
            mock_method.assert_called_once_with(note_id)

    @pytest.mark.asyncio
    async def test_get_note_by_id_not_found_integration(self):
        """Test getting a note by ID when it doesn't exist using method-level mocking."""
        note_id = "non-existent-id"

        with patch.object(
            NoteRepository, "get_note_by_id", return_value=None
        ) as mock_method:
            result = await NoteRepository.get_note_by_id(note_id)

            assert result is None
            mock_method.assert_called_once_with(note_id)

    @pytest.mark.asyncio
    async def test_save_note_integration(self, sample_note: Note):
        """Test saving a note using method-level mocking."""
        with patch.object(
            NoteRepository, "save_note", return_value=sample_note
        ) as mock_method:
            result = await NoteRepository.save_note(sample_note)

            assert result == sample_note
            mock_method.assert_called_once_with(sample_note)

    @pytest.mark.asyncio
    async def test_delete_note_success_integration(self):
        """Test successful note deletion using method-level mocking."""
        note_id = "test-note-123"

        with patch.object(
            NoteRepository, "delete_note", return_value=True
        ) as mock_method:
            result = await NoteRepository.delete_note(note_id)

            assert result is True
            mock_method.assert_called_once_with(note_id)

    @pytest.mark.asyncio
    async def test_delete_note_not_found_integration(self):
        """Test deletion of non-existent note using method-level mocking."""
        note_id = "non-existent-id"

        with patch.object(
            NoteRepository, "delete_note", return_value=False
        ) as mock_method:
            result = await NoteRepository.delete_note(note_id)

            assert result is False
            mock_method.assert_called_once_with(note_id)

    @pytest.mark.asyncio
    async def test_get_note_by_title_and_widget_integration(self):
        """Test getting a note by title and widget ID using method-level mocking."""
        title = "Test Note"
        widget_id = "test-widget-123"
        expected_note = Note(
            id="note-id",
            widget_id=widget_id,
            title=title,
            content="Test content",
            labels=["test"],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        with patch.object(
            NoteRepository, "get_note_by_title_and_widget", return_value=expected_note
        ) as mock_method:
            result = await NoteRepository.get_note_by_title_and_widget(title, widget_id)

            assert result is not None
            assert result == expected_note
            assert result.title == title
            assert result.widget_id == widget_id
            mock_method.assert_called_once_with(title, widget_id)

    @pytest.mark.asyncio
    async def test_get_note_by_obsidian_path_integration(self):
        """Test getting a note by Obsidian path using method-level mocking."""
        obsidian_path = "test-note.md"
        expected_note = Note(
            id="note-id",
            widget_id="test-widget",
            title="Test Note",
            content="Test content",
            labels=["test"],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            source="obsidian",
            obsidian_path=obsidian_path,
        )

        with patch.object(
            NoteRepository, "get_note_by_obsidian_path", return_value=expected_note
        ) as mock_method:
            result = await NoteRepository.get_note_by_obsidian_path(obsidian_path)

            assert result is not None
            assert result == expected_note
            assert result.obsidian_path == obsidian_path
            mock_method.assert_called_once_with(obsidian_path)
