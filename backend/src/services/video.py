from datetime import datetime, timezone
from typing import Any

from src.schemas.video import Video, VideoStatus
from src.settings import settings
from src.supabase_client import supabase_client

VALID_STATUSES: set[VideoStatus] = {"success", "processing", "failed"}


def _normalize_status(value: Any) -> VideoStatus:
    raw = str(value or "").lower()
    if raw in VALID_STATUSES:
        return raw  # type: ignore[return-value]
    return "processing"


def _normalize_created_at(value: Any) -> str:
    if isinstance(value, str) and value.strip():
        return value
    try:
        if value:
            dt = datetime.fromisoformat(str(value))
            return dt.isoformat()
    except ValueError:
        pass
    return datetime.now(timezone.utc).isoformat()


def map_video(record: dict[str, Any]) -> Video:
    result_url = record.get("result_url")
    if isinstance(result_url, str) and not result_url.strip():
        result_url = None

    task_id = record.get("task_id")
    if task_id is not None:
        task_id = str(task_id)

    equipment_id = record.get("equipment_id")
    if equipment_id is not None:
        equipment_id = str(equipment_id)

    return Video(
        id=str(record.get("id")),
        equipment_id=equipment_id,
        created_at=_normalize_created_at(record.get("created_at")),
        status=_normalize_status(record.get("status")),
        result_url=result_url,
        prompt=str(record.get("prompt") or "Untitled video"),
        task_id=task_id,
    )


def list_videos() -> list[Video]:
    data = (
        supabase_client.table(settings.supabase_videos_table)
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    records = data.data or []
    return [map_video(record) for record in records]
