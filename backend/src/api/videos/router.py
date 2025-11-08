from fastapi import APIRouter

from src.schemas.video import Video
from src.services import video as video_service

router = APIRouter(prefix="/videos")


@router.get("", response_model=list[Video])
def list_videos() -> list[Video]:
    return video_service.list_videos()
