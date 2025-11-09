from fastapi import APIRouter, BackgroundTasks, status

from src.schemas.video import Video, VideoCreate
from src.services import video as video_service

router = APIRouter(prefix="/videos")


@router.post("", response_model=Video, status_code=status.HTTP_201_CREATED)
def create_video(payload: VideoCreate, background_tasks: BackgroundTasks) -> Video:
    """Create a new video generation task."""
    video = video_service.create_video_task(payload.equipment_id, payload.prompt)
    # Schedule async video generation in background
    background_tasks.add_task(
        video_service.process_video_generation,
        video.id,
        payload.equipment_id,
        payload.prompt,
    )
    return video


@router.get("", response_model=list[Video])
def list_videos() -> list[Video]:
    return video_service.list_videos()


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video(video_id: str) -> None:
    video_service.delete_video(video_id)
