"""Unit tests for the ObsidianService class."""

from datetime import datetime, timezone
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest
from src.models import Note
from src.obsidian_service import ObsidianService


class TestObsidianService:
    """Test cases for ObsidianService."""

    def _create_mock_http_client(self, mock_client: AsyncMock) -> AsyncMock:
        """Helper to create properly mocked async context manager for httpx.AsyncClient."""
        mock_async_client_context = AsyncMock()
        mock_async_client_context.__aenter__.return_value = mock_client
        mock_async_client_context.__aexit__.return_value = None
        return mock_async_client_context

    @pytest.fixture
    def service(self) -> ObsidianService:
        """Create an ObsidianService instance for testing."""
        return ObsidianService("http://localhost:27123", "test-auth-key")

    @pytest.fixture
    def sample_vault_data(self) -> dict[str, Any]:
        """Sample vault data for testing."""
        return {
            "name": "Test Vault",
            "files": ["note1.md", "note2.md", "subfolder/note3.md", "image.png"],
        }

    def test_init(self) -> None:
        """Test ObsidianService initialization."""
        api_url = "http://localhost:27123"
        auth_key = "test-key"

        service = ObsidianService(api_url, auth_key)

        assert service.api_url == api_url
        assert service.auth_key == auth_key
        assert service.headers["Authorization"] == f"Bearer {auth_key}"
        assert service.headers["Content-Type"] == "application/json"

    def test_convert_localhost_to_docker_host_localhost(self):
        """Test localhost to docker host conversion."""
        service = ObsidianService("http://localhost:27123", "test-key")

        with patch.object(service, "_is_running_in_docker", return_value=True):
            result = service._convert_localhost_to_docker_host("http://localhost:27123")  # type: ignore

            assert result == "http://host.docker.internal:27123"

    def test_convert_localhost_to_docker_host_127_0_0_1(self):
        """Test 127.0.0.1 to docker host conversion."""
        service = ObsidianService("http://127.0.0.1:27123", "test-key")

        with patch.object(service, "_is_running_in_docker", return_value=True):
            result = service._convert_localhost_to_docker_host("http://127.0.0.1:27123")  # type: ignore

            assert result == "http://host.docker.internal:27123"

    def test_convert_localhost_to_docker_host_no_conversion(self):
        """Test no conversion when not in Docker."""
        service = ObsidianService("http://localhost:27123", "test-key")

        with patch.object(service, "_is_running_in_docker", return_value=False):
            result = service._convert_localhost_to_docker_host("http://localhost:27123")  # type: ignore

            assert result == "http://localhost:27123"

    def test_is_running_in_docker_dockerenv_exists(self):
        """Test Docker detection via .dockerenv file."""
        service = ObsidianService("http://localhost:27123", "test-key")

        with patch("os.path.exists", return_value=True):
            result = service._is_running_in_docker()  # type: ignore

            assert result is True

    def test_is_running_in_docker_cgroup_contains_docker(self):
        """Test Docker detection via cgroup file."""
        service = ObsidianService("http://localhost:27123", "test-key")

        mock_open = MagicMock()
        mock_open.return_value.__enter__.return_value.read.return_value = (
            "docker-container-id"
        )

        with patch("os.path.exists", return_value=False):
            with patch("builtins.open", mock_open):
                result = service._is_running_in_docker()  # type: ignore

                assert result is True

    def test_is_running_in_docker_env_var(self):
        """Test Docker detection via environment variables."""
        service = ObsidianService("http://localhost:27123", "test-key")

        with patch("os.path.exists", return_value=False):
            with patch("builtins.open", side_effect=FileNotFoundError):
                with patch("os.getenv", return_value="true"):
                    result = service._is_running_in_docker()  # type: ignore

                    assert result is True

    def test_is_local_url_localhost(self):
        """Test local URL detection for localhost."""
        service = ObsidianService("http://localhost:27123", "test-key")

        result = service._is_local_url()  # type: ignore

        assert result is True

    def test_is_local_url_external(self):
        """Test local URL detection for external URL."""
        service = ObsidianService("https://api.external.com", "test-key")

        result = service._is_local_url()  # type: ignore

        assert result is False

    def test_should_verify_ssl_https_local(self):
        """Test SSL verification for HTTPS local URL."""
        service = ObsidianService("https://localhost:27123", "test-key")

        result = service._should_verify_ssl()  # type: ignore

        assert result is False

    def test_should_verify_ssl_http(self):
        """Test SSL verification for HTTP URL."""
        service = ObsidianService("http://localhost:27123", "test-key")

        result = service._should_verify_ssl()  # type: ignore

        assert result is True

    @pytest.mark.asyncio
    async def test_test_connection_success(self, service: ObsidianService) -> None:
        """Test successful connection test."""
        mock_response = AsyncMock()
        mock_response.status_code = 200

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        mock_async_client_context = AsyncMock()
        mock_async_client_context.__aenter__.return_value = mock_client
        mock_async_client_context.__aexit__.return_value = None

        with patch("httpx.AsyncClient", return_value=mock_async_client_context):
            result = await service.test_connection()

            assert result is True
            mock_client.get.assert_called_once_with(
                f"{service.api_url}/vault/", headers=service.headers
            )

    @pytest.mark.asyncio
    async def test_test_connection_failure(self, service: ObsidianService) -> None:
        """Test failed connection test."""
        mock_client = AsyncMock()
        mock_client.get.side_effect = httpx.ConnectError("Connection failed")

        mock_async_client_context = AsyncMock()
        mock_async_client_context.__aenter__.return_value = mock_client
        mock_async_client_context.__aexit__.return_value = None

        with patch("httpx.AsyncClient", return_value=mock_async_client_context):
            result = await service.test_connection()

            assert result is False

    @pytest.mark.asyncio
    async def test_test_connection_timeout(self, service: ObsidianService) -> None:
        """Test connection timeout."""
        mock_client = AsyncMock()
        mock_client.get.side_effect = httpx.TimeoutException("Timeout")

        with patch("httpx.AsyncClient", return_value=mock_client):
            result = await service.test_connection()

            assert result is False

    @pytest.mark.asyncio
    async def test_get_vault_info_success(
        self, service: ObsidianService, sample_vault_data: dict[str, Any]
    ) -> None:
        """Test successful vault info retrieval."""
        mock_response = MagicMock()
        mock_response.json.return_value = sample_vault_data
        mock_response.raise_for_status.return_value = None

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        mock_context = self._create_mock_http_client(mock_client)

        with patch("httpx.AsyncClient", return_value=mock_context):
            result = await service.get_vault_info()

            assert result == sample_vault_data
            mock_client.get.assert_called_once_with(
                f"{service.api_url}/vault/", headers=service.headers
            )

    @pytest.mark.asyncio
    async def test_get_vault_info_failure(self, service: ObsidianService) -> None:
        """Test vault info retrieval failure."""
        mock_client = AsyncMock()
        mock_client.get.side_effect = httpx.HTTPStatusError(
            "Bad Request", request=MagicMock(), response=MagicMock()
        )

        mock_context = self._create_mock_http_client(mock_client)

        with patch("httpx.AsyncClient", return_value=mock_context):
            with pytest.raises(Exception):
                await service.get_vault_info()

    @pytest.mark.asyncio
    async def test_list_files_success(
        self, service: ObsidianService, sample_vault_data: dict[str, Any]
    ) -> None:
        """Test successful file listing."""
        mock_response = MagicMock()
        mock_response.json.return_value = sample_vault_data
        mock_response.raise_for_status.return_value = None

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        mock_context = self._create_mock_http_client(mock_client)

        with patch("httpx.AsyncClient", return_value=mock_context):
            result = await service.list_files()

            expected_md_files = ["note1.md", "note2.md", "subfolder/note3.md"]
            assert result == expected_md_files

    @pytest.mark.asyncio
    async def test_get_file_content_success(self, service: ObsidianService) -> None:
        """Test successful file content retrieval."""
        file_path = "test-note.md"
        expected_content = "# Test Note\n\nThis is test content."

        mock_response = MagicMock()
        mock_response.text = expected_content
        mock_response.raise_for_status.return_value = None

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        mock_context = self._create_mock_http_client(mock_client)

        with patch("httpx.AsyncClient", return_value=mock_context):
            result = await service.get_file_content(file_path)

            assert result == expected_content
            mock_client.get.assert_called_once_with(
                f"{service.api_url}/vault/{file_path}", headers=service.headers
            )

    @pytest.mark.asyncio
    async def test_create_or_update_file_success(
        self, service: ObsidianService
    ) -> None:
        """Test successful file creation/update."""
        file_path = "test-note.md"
        content = "# Test Note\n\nThis is test content."

        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None

        mock_client = AsyncMock()
        mock_client.put.return_value = mock_response

        mock_context = self._create_mock_http_client(mock_client)

        with patch("httpx.AsyncClient", return_value=mock_context):
            result = await service.create_or_update_file(file_path, content)

            assert result is True
            expected_headers = {
                "Authorization": f"Bearer {service.auth_key}",
                "Content-Type": "application/markdown",
            }
            mock_client.put.assert_called_once_with(
                f"{service.api_url}/vault/{file_path}",
                headers=expected_headers,
                content=content,
            )

    @pytest.mark.asyncio
    async def test_create_or_update_file_failure(
        self, service: ObsidianService
    ) -> None:
        """Test file creation/update failure."""
        file_path = "test-note.md"
        content = "# Test Note\n\nThis is test content."

        mock_client = AsyncMock()
        mock_client.put.side_effect = httpx.HTTPStatusError(
            "Internal Server Error", request=MagicMock(), response=MagicMock()
        )

        mock_context = self._create_mock_http_client(mock_client)

        with patch("httpx.AsyncClient", return_value=mock_context):
            result = await service.create_or_update_file(file_path, content)

            assert result is False

    @pytest.mark.asyncio
    async def test_delete_file_success(self, service: ObsidianService) -> None:
        """Test successful file deletion."""
        file_path = "test-note.md"

        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None

        mock_client = AsyncMock()
        mock_client.delete.return_value = mock_response

        mock_context = self._create_mock_http_client(mock_client)

        with patch("httpx.AsyncClient", return_value=mock_context):
            result = await service.delete_file(file_path)

            assert result is True
            mock_client.delete.assert_called_once_with(
                f"{service.api_url}/vault/{file_path}",
                headers=service.headers,
            )

    @pytest.mark.asyncio
    async def test_delete_file_failure(self, service: ObsidianService) -> None:
        """Test file deletion failure."""
        # Arrange
        file_path = "test-note.md"

        mock_client = AsyncMock()
        mock_client.delete.side_effect = httpx.HTTPStatusError(
            "Not Found", request=MagicMock(), response=MagicMock()
        )

        mock_context = self._create_mock_http_client(mock_client)

        with patch("httpx.AsyncClient", return_value=mock_context):
            result = await service.delete_file(file_path)

            assert result is False

    @pytest.mark.asyncio
    async def test_sync_vault_to_notes_success(self, service: ObsidianService) -> None:
        """Test successful vault sync to notes."""
        widget_id = "test-widget-123"
        files = ["note1.md", "note2.md"]
        file_content = "# Test Note\n\nThis is test content."

        with patch.object(service, "list_files", return_value=files):
            with patch.object(service, "_create_note_from_file") as mock_create_note:
                sample_note = Note(
                    id="test-id",
                    widget_id=widget_id,
                    title="Test Note",
                    content=file_content,
                    labels=[],
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc),
                    source="obsidian",
                    obsidian_path="note1.md",
                )
                mock_create_note.return_value = sample_note

                result = await service.sync_vault_to_notes(widget_id)

                assert len(result) == 2
                assert all(isinstance(note, Note) for note in result)
                assert mock_create_note.call_count == 2

    def test_extract_tags_from_content_frontmatter(self, service: ObsidianService):
        """Test tag extraction from frontmatter."""
        content = """---
tags: ["test", "sample", "note"]
---

# Test Note

This is test content."""

        result = service._extract_tags_from_content(content)  # type: ignore

        expected_tags = ["test", "sample", "note"]
        assert set(result) == set(expected_tags)

    def test_extract_tags_from_content_inline(self, service: ObsidianService):
        """Test tag extraction from inline tags."""
        content = """# Test Note

This is test content with #tag1 and #tag2 inline tags."""

        result = service._extract_tags_from_content(content)  # type: ignore

        expected_tags = ["tag1", "tag2"]
        assert set(result) == set(expected_tags)

    def test_extract_tags_from_content_mixed(self, service: ObsidianService):
        """Test tag extraction from both frontmatter and inline tags."""
        content = """---
tags: ["frontmatter", "yaml"]
---

# Test Note

This is test content with #inline and #tags."""

        result = service._extract_tags_from_content(content)  # type: ignore

        expected_tags = ["frontmatter", "yaml", "inline", "tags"]
        assert set(result) == set(expected_tags)

    def test_create_frontmatter_with_labels(self, service: ObsidianService):
        """Test frontmatter creation with labels."""
        labels = ["test", "sample", "note"]

        result = service.create_frontmatter(labels)

        expected = '---\ntags: ["test", "sample", "note"]\n---\n\n'
        assert result == expected

    def test_create_frontmatter_empty_labels(self, service: ObsidianService):
        """Test frontmatter creation with empty labels."""
        labels: list[str] = []

        result = service.create_frontmatter(labels)

        assert result == ""

    def test_create_safe_filename(self, service: ObsidianService):
        """Test safe filename creation."""
        title = 'Test: "Note" with <special> characters?'

        result = service.create_safe_filename(title)

        expected = "Test Note with special characters.md"
        assert result == expected

    def test_create_safe_filename_normal(self, service: ObsidianService):
        """Test safe filename creation with normal title."""
        title = "Normal Note Title"

        result = service.create_safe_filename(title)

        expected = "Normal Note Title.md"
        assert result == expected
