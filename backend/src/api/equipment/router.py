from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile

from src.schemas.equipment import Equipment, EquipmentCreate, EquipmentUpdate
from src.schemas.video import Video, VideoCreate
from src.services import equipment as equipment_service
from src.services import video as video_service

router = APIRouter(prefix="/equipments")


@router.post("", response_model=Equipment)
def create_equipment(payload: EquipmentCreate) -> Equipment:
    return equipment_service.create_equipment(payload.name)


@router.get("", response_model=list[Equipment])
def list_equipments() -> list[Equipment]:
    return equipment_service.list_equipments()


@router.patch("/{equipment_id}", response_model=Equipment)
def update_equipment(equipment_id: str, payload: EquipmentUpdate) -> Equipment:
    return equipment_service.update_equipment(equipment_id, payload.name)


@router.post("/{equipment_id}/manuals", response_model=Equipment)
async def upload_manual(equipment_id: str, file: UploadFile = File(...)) -> Equipment:
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File is empty")
    filename = file.filename or "file"
    return equipment_service.add_manual(
        equipment_id, content, filename, file.content_type
    )


@router.post("/{equipment_id}/images", response_model=Equipment)
async def upload_image(equipment_id: str, file: UploadFile = File(...)) -> Equipment:
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File is empty")
    filename = file.filename or "file"
    return equipment_service.add_image(
        equipment_id, content, filename, file.content_type
    )


@router.delete("/{equipment_id}/manuals", response_model=Equipment)
def delete_manual(equipment_id: str, url: str) -> Equipment:
    return equipment_service.remove_manual(equipment_id, url)


@router.delete("/{equipment_id}/images", response_model=Equipment)
def delete_image(equipment_id: str, url: str) -> Equipment:
    return equipment_service.remove_image(equipment_id, url)


@router.post("/{equipment_id}/videos", response_model=Video)
async def create_video(
    equipment_id: str, payload: VideoCreate, background_tasks: BackgroundTasks
) -> Video:
    video = video_service.create_video_task(equipment_id, payload.prompt)
    background_tasks.add_task(
        video_service.process_video_generation, video.id, equipment_id, payload.prompt
    )
    return video


@router.get("/{equipment_id}/videos", response_model=list[Video])
def list_videos(equipment_id: str) -> list[Video]:
    return video_service.list_videos(equipment_id)
