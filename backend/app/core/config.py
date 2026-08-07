import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = True

    # JWT Authentication Secrets
    JWT_SECRET_KEY: str = "dev_secret_key_9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c"
    JWT_REFRESH_SECRET_KEY: str = "dev_refresh_secret_key_1a2b3c4d5e6f7g8h9i0j"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AI Provider API Keys
    AI_PROVIDER: str = "auto"  # auto, breeth, gemini
    BREETH_API_KEY: str = ""
    BREETH_API_URL: str = "https://api.breeth.ai/v1/chat/completions"
    GEMINI_API_KEY: str = ""

    # CORS Origins (Comma-separated string or list)
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    AUTH_RATE_LIMIT_PER_MINUTE: int = 10

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./backend_app.db"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return self.CORS_ORIGINS


settings = Settings()
