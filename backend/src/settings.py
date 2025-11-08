from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    google_api_key: str
    supabase_equipment_table: str
    supabase_manuals_storage: str
    supabase_images_storage: str
    supabase_videos_table: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
