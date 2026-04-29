from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "PanganTrace AI"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Azure OpenAI
    AZURE_OPENAI_ENDPOINT: str = ""
    AZURE_OPENAI_KEY: str = ""
    AZURE_OPENAI_DEPLOYMENT: str = "gpt-4o"
    AZURE_OPENAI_API_VERSION: str = "2024-11-20"

    # Azure SQL
    AZURE_SQL_SERVER: str = ""
    AZURE_SQL_DATABASE: str = ""
    AZURE_SQL_USERNAME: str = ""
    AZURE_SQL_PASSWORD: str = ""

    # Azure Event Hubs
    AZURE_EVENTHUB_CONNECTION: str = ""
    AZURE_EVENTHUB_NAME: str = "pangan-transactions"

    # Security — used for signing JWT tokens and session data
    SECRET_KEY: str = "pangantrace-dev-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
