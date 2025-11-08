from fastapi import APIRouter

from src.api.equipment import router as equipment_router

api_router = APIRouter()
api_router.include_router(equipment_router)
