import re
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


def _sanitize_filename(filename: str) -> str:
    """Sanitize filename to remove special characters not allowed by Supabase Storage."""
    # Replace spaces and special characters with underscores
    sanitized = re.sub(r'[^\w\-.]', '_', filename)
    # Remove multiple consecutive underscores
    sanitized = re.sub(r'_+', '_', sanitized)
    return sanitized


def _store_asset(
    bucket: str, equipment_id: str, filename: str, data: bytes, content_type: str | None
) -> str:
    sanitized_filename = _sanitize_filename(filename)
    path = f"{equipment_id}/{uuid4()}-{sanitized_filename}"
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


def update_equipment(equipment_id: str, name: str) -> Equipment:
    # Check if equipment exists
    fetch_equipment(equipment_id)
    # Update the equipment
    result = (
        supabase_client.table(settings.supabase_equipment_table)
        .update({"name": name})
        .eq("id", equipment_id)
        .execute()
    )
    record = (result.data or [])[0]
    return map_equipment(record)


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


def _remove_asset(equipment_id: str, column: str, url: str) -> Equipment:
    """Remove an asset URL from the equipment's list and delete from storage."""
    equipment = fetch_equipment(equipment_id)
    values = equipment.get(column) or []

    if url not in values:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Remove URL from list
    values.remove(url)

    # Update database
    updated = (
        supabase_client.table(settings.supabase_equipment_table)
        .update({column: values})
        .eq("id", equipment_id)
        .execute()
    )

    # Extract the storage path from the URL and delete from storage
    # URL format: https://.../storage/v1/object/public/bucket/path
    try:
        # Parse the URL to get the path after the bucket name
        url_parts = url.split("/")
        if "object" in url_parts and "public" in url_parts:
            public_idx = url_parts.index("public")
            # Path starts after bucket name (public_idx + 2)
            path = "/".join(url_parts[public_idx + 2:])

            # Determine which bucket based on column
            bucket = (
                settings.supabase_manuals_storage
                if column == "manuals"
                else settings.supabase_images_storage
            )

            # Delete from storage
            storage = supabase_client.storage.from_(bucket)
            storage.remove([path])
    except Exception as e:
        # Log error but don't fail the request since DB is already updated
        print(f"Failed to delete file from storage: {e}")

    record = (updated.data or [fetch_equipment(equipment_id)])[0]
    return map_equipment(record)


def remove_manual(equipment_id: str, url: str) -> Equipment:
    """Remove a manual from equipment."""
    return _remove_asset(equipment_id, "manuals", url)


def remove_image(equipment_id: str, url: str) -> Equipment:
    """Remove an image from equipment."""
    return _remove_asset(equipment_id, "images", url)
