from typing import Literal

from pydantic import BaseModel, Field

VideoStatus = Literal["success", "processing", "failed"]


class VideoCreate(BaseModel):
    equipment_id: str
    prompt: str


class Video(BaseModel):
    id: str
    equipment_id: str | None = Field(default=None)
    created_at: str
    status: VideoStatus
    result_url: str | None = Field(default=None)
    prompt: str
    task_id: str | None = Field(default=None)
