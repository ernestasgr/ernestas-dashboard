"""Obsidian service for vault integration."""

import logging
import os
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

import httpx
from fastapi import HTTPException
from models import Note

logger = logging.getLogger(__name__)


class ObsidianService:
    """Service for interacting with Obsidian Local REST API."""

    def __init__(self, api_url: str, auth_key: str):
        self.api_url = self._convert_localhost_to_docker_host(api_url.rstrip("/"))
        self.auth_key = auth_key
        self.headers = {
            "Authorization": f"Bearer {auth_key}",
            "Content-Type": "application/json",
        }

    def _convert_localhost_to_docker_host(self, api_url: str) -> str:
        """Convert localhost URLs to host.docker.internal when running in Docker."""
        if self._is_running_in_docker():
            if "://localhost" in api_url:
                converted_url = api_url.replace(
                    "://localhost", "://host.docker.internal"
                )
                logger.info(
                    f"Converted localhost URL to Docker host: {api_url} -> {converted_url}"
                )
                return converted_url
            elif "://127.0.0.1" in api_url:
                converted_url = api_url.replace(
                    "://127.0.0.1", "://host.docker.internal"
                )
                logger.info(
                    f"Converted 127.0.0.1 URL to Docker host: {api_url} -> {converted_url}"
                )
                return converted_url

        return api_url

    def _is_running_in_docker(self) -> bool:
        """Check if the application is running inside a Docker container."""
        try:
            if os.path.exists("/.dockerenv"):
                return True

            with open("/proc/1/cgroup", "r") as f:
                content = f.read()
                return "docker" in content or "containerd" in content
        except (FileNotFoundError, PermissionError):
            container_indicators = [
                "DOCKER_CONTAINER",
                "KUBERNETES_SERVICE_HOST",
                "CONTAINER",
            ]
            return any(os.getenv(var) for var in container_indicators)
        except Exception:
            return False

    def _is_local_url(self) -> bool:
        """Check if the API URL is pointing to a local/development environment."""
        local_indicators = ["localhost", "127.0.0.1", "host.docker.internal", "0.0.0.0"]
        return any(indicator in self.api_url for indicator in local_indicators)

    def _should_verify_ssl(self) -> bool:
        """Determine if SSL verification should be enabled."""
        return not self.api_url.startswith("https://") or not self._is_local_url()

    async def test_connection(self) -> bool:
        """Test if the Obsidian API is accessible."""
        try:
            verify_ssl = self._should_verify_ssl()

            async with httpx.AsyncClient(timeout=10.0, verify=verify_ssl) as client:
                response = await client.get(
                    f"{self.api_url}/vault/", headers=self.headers
                )
                logger.info(
                    f"Obsidian connection test to {self.api_url}, status code: {response.status_code}, SSL verification: {verify_ssl}"
                )
                return response.status_code == 200
        except httpx.ConnectError as e:
            self._log_connection_error(e)
            return False
        except httpx.TimeoutException as e:
            logger.error(f"Obsidian connection timed out: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Obsidian connection failed: {str(e)}")
            return False

    def _log_connection_error(self, error: httpx.ConnectError) -> None:
        """Log detailed connection error information."""
        logger.error(
            f"Obsidian connection failed - cannot connect to {self.api_url}: {str(error)}"
        )
        if "CERTIFICATE_VERIFY_FAILED" in str(error):
            logger.error(
                "SSL certificate verification failed. Consider using HTTP instead of HTTPS for local development, or ensure your Obsidian API has a valid certificate."
            )
        elif "host.docker.internal" in self.api_url:
            logger.error(
                "Connection to host.docker.internal failed. Make sure Obsidian Local REST API is running on your host machine."
            )
        else:
            logger.error(
                "Hint: If Obsidian is running on host machine and this service is in Docker, the URL should use 'host.docker.internal' instead of 'localhost'"
            )

    async def get_vault_info(self) -> Dict[str, Any]:
        """Get information about the vault."""
        try:
            verify_ssl = self._should_verify_ssl()
            async with httpx.AsyncClient(verify=verify_ssl) as client:
                response = await client.get(
                    f"{self.api_url}/vault/", headers=self.headers
                )
                response.raise_for_status()
                data = response.json()
                logger.info(f"Retrieved vault info, vault name: {data.get('name')}")
                return data
        except Exception as e:
            logger.error(f"Failed to get vault info: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to get vault info: {str(e)}"
            )

    async def list_files(self) -> List[str]:
        """List all markdown files in the vault."""
        try:
            verify_ssl = self._should_verify_ssl()
            async with httpx.AsyncClient(verify=verify_ssl) as client:
                response = await client.get(
                    f"{self.api_url}/vault/", headers=self.headers
                )
                response.raise_for_status()
                vault_data = response.json()
                files = vault_data.get("files", [])

                md_files = [
                    f for f in files if isinstance(f, str) and f.endswith(".md")
                ]
                logger.info(
                    f"Listed vault files, total files: {len(files)}, markdown files: {len(md_files)}"
                )
                return md_files
        except Exception as e:
            logger.error(f"Failed to list files: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to list files: {str(e)}"
            )

    async def get_file_content(self, file_path: str) -> str:
        """Get content of a specific file."""
        try:
            verify_ssl = self._should_verify_ssl()
            async with httpx.AsyncClient(verify=verify_ssl) as client:
                response = await client.get(
                    f"{self.api_url}/vault/{file_path}", headers=self.headers
                )
                response.raise_for_status()
                content = response.text
                logger.info(
                    f"Retrieved file content for {file_path}, content length: {len(content)}"
                )
                return content
        except Exception as e:
            logger.error(f"Failed to get file content for {file_path}: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to get file content: {str(e)}"
            )

    async def create_or_update_file(self, file_path: str, content: str) -> bool:
        """Create or update a file in the Obsidian vault."""
        try:
            verify_ssl = self._should_verify_ssl()

            put_headers = {
                "Authorization": f"Bearer {self.auth_key}",
                "Content-Type": "application/markdown",
            }

            async with httpx.AsyncClient(verify=verify_ssl) as client:
                response = await client.put(
                    f"{self.api_url}/vault/{file_path}",
                    headers=put_headers,
                    content=content,
                )
                response.raise_for_status()
                logger.info(f"Successfully updated file in Obsidian: {file_path}")
                return True
        except Exception as e:
            logger.error(
                f"Failed to create/update file {file_path} in Obsidian: {str(e)}"
            )
            return False

    async def delete_file(self, file_path: str) -> bool:
        """Delete a file from the Obsidian vault."""
        try:
            verify_ssl = self._should_verify_ssl()

            async with httpx.AsyncClient(verify=verify_ssl) as client:
                response = await client.delete(
                    f"{self.api_url}/vault/{file_path}",
                    headers=self.headers,
                )
                response.raise_for_status()
                logger.info(f"Successfully deleted file from Obsidian: {file_path}")
                return True
        except Exception as e:
            logger.error(f"Failed to delete file {file_path} from Obsidian: {str(e)}")
            return False

    async def sync_vault_to_notes(self, widget_id: str) -> List[Note]:
        """Sync all files from Obsidian vault as notes."""
        try:
            files = await self.list_files()
            notes: List[Note] = []

            for file_path in files:
                if not file_path.endswith(".md"):
                    continue

                try:
                    note = await self._create_note_from_file(file_path, widget_id)
                    notes.append(note)
                except Exception as e:
                    logger.error(f"Failed to process file {file_path}: {str(e)}")
                    continue

            logger.info(
                f"Synced vault to notes for widget {widget_id}, notes count: {len(notes)}"
            )
            return notes

        except Exception as e:
            logger.error(f"Failed to sync vault for widget {widget_id}: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to sync vault: {str(e)}"
            )

    async def _create_note_from_file(self, file_path: str, widget_id: str) -> Note:
        """Create a Note object from an Obsidian file."""
        content = await self.get_file_content(file_path)
        title = file_path.replace(".md", "").split("/")[-1]
        labels = self._extract_tags_from_content(content)
        note_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"obsidian:{file_path}"))
        now = datetime.now(timezone.utc)

        return Note(
            id=note_id,
            widget_id=widget_id,
            title=title,
            content=content,
            labels=labels,
            created_at=now,
            updated_at=now,
            source="obsidian",
            obsidian_path=file_path,
        )

    def _extract_tags_from_content(self, content: str) -> List[str]:
        """Extract tags from frontmatter and inline tags."""
        tags: List[str] = []

        frontmatter_match = re.search(r"^---\n(.*?)\n---", content, re.DOTALL)
        if frontmatter_match:
            frontmatter = frontmatter_match.group(1)
            tag_match = re.search(r"tags:\s*\[(.*?)\]", frontmatter)
            if tag_match:
                tag_string = tag_match.group(1)
                tags.extend([tag.strip().strip("\"'") for tag in tag_string.split(",")])

        inline_tags = re.findall(r"#(\w+)", content)
        tags.extend(inline_tags)

        return list(set(tags))

    def create_frontmatter(self, labels: List[str]) -> str:
        """Create frontmatter with labels if any."""
        if not labels:
            return ""

        labels_str = ", ".join([f'"{label}"' for label in labels])
        return f"---\ntags: [{labels_str}]\n---\n\n"

    def create_safe_filename(self, title: str) -> str:
        """Create a safe filename from a title."""
        return re.sub(r'[<>:"/\\|?*]', "", title) + ".md"
