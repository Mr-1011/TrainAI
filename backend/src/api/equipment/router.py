from fastapi import APIRouter, File, HTTPException, UploadFile

from src.schemas.equipment import Equipment, EquipmentCreate
from src.services import equipment as equipment_service

router = APIRouter(prefix="/equipments")


@router.post("", response_model=Equipment)
def create_equipment(payload: EquipmentCreate) -> Equipment:
    return equipment_service.create_equipment(payload.name)


@router.get("", response_model=list[Equipment])
def list_equipments() -> list[Equipment]:
    return equipment_service.list_equipments()


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
