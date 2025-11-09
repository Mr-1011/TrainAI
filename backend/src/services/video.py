from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException
from runware import (
    IAsyncTaskResponse,
    IGoogleProviderSettings,
    IVideo,
    IVideoInference,
    Runware,
    RunwareError,
)

from src.schemas.video import Video, VideoStatus
from src.settings import settings
from src.supabase_client import supabase_client
from src.services import equipment as equipment_service

VALID_STATUSES: set[VideoStatus] = {"success", "processing", "failed"}

runware_client = Runware(api_key=settings.runware_api_key)


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


def _create_video_record(
    prompt: str,
    equipment_id: str,
    status: str,
    result_url: str | None,
    task_id: str | None,
) -> Video:
    data = (
        supabase_client.table(settings.supabase_video_table)
        .insert(
            {
                "prompt": prompt,
                "equipment_id": equipment_id,
                "status": status,
                "result_url": result_url or "",
                "task_id": task_id,
            }
        )
        .execute()
    )
    record = (data.data or [])[0]
    return map_video(record)


def _update_video_record(
    video_id: str,
    *,
    status: str | None = None,
    result_url: str | None = None,
    task_id: str | None = None,
):
    payload: dict[str, Any] = {}
    if status is not None:
        payload["status"] = status
    if result_url is not None:
        payload["result_url"] = result_url
    if task_id is not None:
        payload["task_id"] = task_id
    if not payload:
        return
    supabase_client.table(settings.supabase_video_table).update(payload).eq(
        "id", video_id
    ).execute()


def _build_video_request(prompt: str, reference_images: list[str]) -> IVideoInference:
    return IVideoInference(
        model="google:3@2",
        positivePrompt=prompt,
        duration=8,
        fps=24,
        width=1280,
        height=720,
        outputFormat="MP4",
        outputQuality=85,
        includeCost=True,
        numberResults=1,
        referenceImages=reference_images,
        providerSettings=IGoogleProviderSettings(
            generateAudio=True,
            enhancePrompt=True,
        ),
    )


def _extract_response_data(
    response: list[IVideo] | IAsyncTaskResponse,
) -> tuple[str, str | None, str | None]:
    status = "processing"
    result_url = None
    task_id = None
    if isinstance(response, list) and response:
        first = response[0]
        status = first.status or status
        result_url = first.videoURL or first.mediaURL
        task_id = first.taskUUID
    elif isinstance(response, IAsyncTaskResponse):
        task_id = response.taskUUID
    return status, result_url, task_id


def create_video_task(equipment_id: str, prompt: str) -> Video:
    """Create a video generation task."""
    equipment = equipment_service.get_equipment(equipment_id)
    if not equipment.images:
        raise HTTPException(status_code=400, detail="Equipment has no images")
    return _create_video_record(prompt, equipment_id, "queued", None, None)


async def process_video_generation(
    video_id: str, equipment_id: str, prompt: str
) -> None:
    """Process video generation asynchronously."""
    try:
        equipment = equipment_service.get_equipment(equipment_id)
    except HTTPException:
        _update_video_record(video_id, status="failed")
        return
    if not equipment.images:
        _update_video_record(video_id, status="failed")
        return
    request = _build_video_request(prompt, equipment.images)
    try:
        response = await runware_client.videoInference(request)
    except RunwareError:
        _update_video_record(video_id, status="failed")
        return
    status, result_url, task_id = _extract_response_data(response)
    _update_video_record(
        video_id,
        status=status,
        result_url=result_url or "",
        task_id=task_id,
    )


def list_videos(equipment_id: str | None = None) -> list[Video]:
    """List all videos, optionally filtered by equipment ID."""
    query = supabase_client.table(settings.supabase_video_table).select("*")
    if equipment_id:
        query = query.eq("equipment_id", equipment_id)
    data = query.order("created_at", desc=True).execute()
    records = data.data or []
    return [map_video(record) for record in records]


def delete_video(video_id: str) -> None:
    """Delete a video by ID."""
    # Check if video exists
    result = (
        supabase_client.table(settings.supabase_video_table)
        .select("*")
        .eq("id", video_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Video not found")

    # Delete the video
    supabase_client.table(settings.supabase_video_table).delete().eq(
        "id", video_id
    ).execute()
