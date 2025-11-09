from fastapi import APIRouter, status

from src.schemas.video import Video
from src.services import video as video_service

router = APIRouter(prefix="/videos")


@router.get("", response_model=list[Video])
def list_videos() -> list[Video]:
    return video_service.list_videos()


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video(video_id: str) -> None:
    video_service.delete_video(video_id)
