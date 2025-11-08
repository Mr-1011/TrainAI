from fastapi import APIRouter

from src.api.equipment import router as equipment_router
from src.api.videos import router as video_router

api_router = APIRouter()
api_router.include_router(equipment_router)
api_router.include_router(video_router)
