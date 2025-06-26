"""GraphQL schema types and inputs for the notes service."""

from datetime import datetime
from typing import List, Optional

import strawberry


@strawberry.federation.type(keys=["id"])
class NoteType:
    """GraphQL type for notes."""

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
    source: str = "local"
    obsidian_path: Optional[str] = None


@strawberry.input
class CreateNoteInput:
    """Input for creating a new note."""

    widget_id: strawberry.ID
    title: str
    content: str
    labels: List[str] = strawberry.field(default_factory=list)
    x: Optional[int] = None
    y: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None


@strawberry.input
class CreateNoteWithObsidianSyncInput:
    """Input for creating a new note with Obsidian sync."""

    widget_id: strawberry.ID
    title: str
    content: str
    labels: List[str] = strawberry.field(default_factory=list)
    x: Optional[int] = None
    y: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    sync_to_obsidian: bool = False
    obsidian_api_url: Optional[str] = None
    obsidian_auth_key: Optional[str] = None


@strawberry.input
class UpdateNoteInput:
    """Input for updating an existing note."""

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
    """Input for updating note layout properties."""

    id: strawberry.ID
    x: int
    y: int
    width: int
    height: int


@strawberry.input
class UpdateNoteWithObsidianSyncInput:
    """Input for updating a note with Obsidian sync."""

    id: strawberry.ID
    title: Optional[str] = None
    content: Optional[str] = None
    labels: Optional[List[str]] = None
    x: Optional[int] = None
    y: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    sync_to_obsidian: bool = False
    obsidian_api_url: Optional[str] = None
    obsidian_auth_key: Optional[str] = None


@strawberry.input
class DeleteNoteWithObsidianSyncInput:
    """Input for deleting a note with Obsidian sync."""

    id: strawberry.ID
    sync_to_obsidian: bool = False
    obsidian_api_url: Optional[str] = None
    obsidian_auth_key: Optional[str] = None


@strawberry.input
class NotesFilterInput:
    """Input for filtering notes by widget and labels."""

    widget_id: strawberry.ID
    labels: Optional[List[str]] = None


@strawberry.input
class ObsidianSyncInput:
    """Input for syncing with Obsidian vault."""

    widget_id: strawberry.ID
    api_url: str
    auth_key: str


@strawberry.input
class ObsidianTestConnectionInput:
    """Input for testing Obsidian connection."""

    api_url: str
    auth_key: str


@strawberry.input
class CreateOrUpdateObsidianFileInput:
    """Input for creating or updating an Obsidian file."""

    api_url: str
    auth_key: str
    file_path: str
    content: str
