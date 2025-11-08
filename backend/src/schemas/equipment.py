from pydantic import BaseModel


class EquipmentCreate(BaseModel):
    name: str


class Equipment(BaseModel):
    id: str
    name: str
    manuals: list[str]
    images: list[str]
