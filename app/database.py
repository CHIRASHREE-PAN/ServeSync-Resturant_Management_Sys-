from typing import Generator, Iterator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

settings = get_settings()


class Base(DeclarativeBase):
    pass


from app import models  # noqa: F401

engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_database_if_not_exists() -> None:
    server_url = settings.mysql_url
    server_engine = create_engine(server_url, pool_pre_ping=True, future=True)

    with server_engine.connect() as connection:
        database_exists = connection.execute(
            text(
                "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = :db_name"
            ),
            {"db_name": settings.db_name},
        ).scalar()

        if database_exists is None:
            connection.execute(text(f"CREATE DATABASE `{settings.db_name}`"))
            print(f"Database '{settings.db_name}' created successfully.")
        else:
            print(f"Database '{settings.db_name}' already exists.")

    server_engine.dispose()


def initialize_database() -> None:
    create_database_if_not_exists()
    Base.metadata.create_all(bind=engine)
    print("Database tables ensured successfully.")
