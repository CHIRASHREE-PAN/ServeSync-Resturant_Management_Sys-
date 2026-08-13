from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "RestaurantManagementSystem"
    app_version: str = "1.0.0"

    # Database
    db_driver: str = "mysql+pymysql"
    db_user: str = "root"
    db_password: str = "1234"
    db_host: str = "localhost"
    db_port: int = 3306
    db_name: str = "restaurant_db"

    # JWT
    jwt_secret: str = "change-this-secret"
    jwt_algorithm: str = "HS256"
    jwt_expiry_minutes: int = 60

    # Resend Email
    resend_api_key: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def mysql_url(self) -> str:
        return (
            f"{self.db_driver}://"
            f"{self.db_user}:{self.db_password}@"
            f"{self.db_host}:{self.db_port}/"
        )

    @property
    def database_url(self) -> str:
        return (
            f"{self.db_driver}://"
            f"{self.db_user}:{self.db_password}@"
            f"{self.db_host}:{self.db_port}/"
            f"{self.db_name}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()