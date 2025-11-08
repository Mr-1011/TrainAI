from typing import Any
from uuid import uuid4

from fastapi import HTTPException

from src.schemas.equipment import Equipment
from src.settings import settings
from src.supabase_client import supabase_client


def map_equipment(record: dict[str, Any]) -> Equipment:
    return Equipment(
        id=record["id"],
        name=record["name"],
        manuals=record.get("manuals") or [],
        images=record.get("images") or [],
    )


def fetch_equipment(equipment_id: str) -> dict[str, Any]:
    result = (
        supabase_client.table(settings.supabase_equipment_table)
        .select("*")
        .eq("id", equipment_id)
        .execute()
    )
    records = result.data or []
    if not records:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return records[0]


def _attach_asset(equipment_id: str, column: str, url: str) -> Equipment:
    equipment = fetch_equipment(equipment_id)
    values = equipment.get(column) or []
    values.append(url)
    updated = (
        supabase_client.table(settings.supabase_equipment_table)
        .update({column: values})
        .eq("id", equipment_id)
        .execute()
    )
    record = (updated.data or [fetch_equipment(equipment_id)])[0]
    return map_equipment(record)


def _store_asset(
    bucket: str, equipment_id: str, filename: str, data: bytes, content_type: str | None
) -> str:
    path = f"{equipment_id}/{uuid4()}-{filename}"
    storage = supabase_client.storage.from_(bucket)
    storage.upload(
        path, data, {"content-type": content_type or "application/octet-stream"}
    )
    public_url = storage.get_public_url(path)
    if isinstance(public_url, dict):
        url = public_url.get("publicUrl") or ""
    else:
        url = public_url or ""
    if not url:
        raise HTTPException(status_code=500, detail="Unable to store asset")
    return url


def create_equipment(name: str) -> Equipment:
    data = (
        supabase_client.table(settings.supabase_equipment_table)
        .insert({"name": name, "manuals": [], "images": []})
        .execute()
    )
    record = (data.data or [])[0]
    return map_equipment(record)


def list_equipments() -> list[Equipment]:
    data = (
        supabase_client.table(settings.supabase_equipment_table).select("*").execute()
    )
    records = data.data or []
    return [map_equipment(record) for record in records]


def add_manual(
    equipment_id: str, data: bytes, filename: str, content_type: str | None
) -> Equipment:
    url = _store_asset(
        settings.supabase_manuals_storage,
        equipment_id,
        filename,
        data,
        content_type,
    )
    return _attach_asset(equipment_id, "manuals", url)


def add_image(
    equipment_id: str, data: bytes, filename: str, content_type: str | None
) -> Equipment:
    url = _store_asset(
        settings.supabase_images_storage,
        equipment_id,
        filename,
        data,
        content_type,
    )
    return _attach_asset(equipment_id, "images", url)
