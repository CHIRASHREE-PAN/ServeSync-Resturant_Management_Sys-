from typing import Generator

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


def ensure_customer_session_schema() -> None:
    with engine.begin() as connection:
        columns = [row[0] for row in connection.execute(text("SHOW COLUMNS FROM customer_sessions"))]

        if "session_id" not in columns:
            connection.execute(text("ALTER TABLE customer_sessions ADD COLUMN session_id VARCHAR(64) NULL"))
            connection.execute(text("UPDATE customer_sessions SET session_id = UUID() WHERE session_id IS NULL"))
            connection.execute(text("ALTER TABLE customer_sessions MODIFY COLUMN session_id VARCHAR(64) NOT NULL"))
            connection.execute(text("CREATE UNIQUE INDEX uq_customer_sessions_session_id ON customer_sessions (session_id)"))

        if "started_at" not in columns:
            connection.execute(text("ALTER TABLE customer_sessions ADD COLUMN started_at DATETIME NULL"))
            connection.execute(text("UPDATE customer_sessions SET started_at = created_at WHERE started_at IS NULL"))
            connection.execute(text("ALTER TABLE customer_sessions MODIFY COLUMN started_at DATETIME NOT NULL"))

        if "ended_at" not in columns:
            connection.execute(text("ALTER TABLE customer_sessions ADD COLUMN ended_at DATETIME NULL"))

        if "number_of_people" not in columns:
            if "people" in columns:
                connection.execute(text("ALTER TABLE customer_sessions ADD COLUMN number_of_people INT NULL"))
                connection.execute(text("UPDATE customer_sessions SET number_of_people = people WHERE number_of_people IS NULL"))
                connection.execute(text("ALTER TABLE customer_sessions MODIFY COLUMN number_of_people INT NOT NULL"))
                connection.execute(text("ALTER TABLE customer_sessions DROP COLUMN people"))
            else:
                connection.execute(text("ALTER TABLE customer_sessions ADD COLUMN number_of_people INT NOT NULL DEFAULT 1"))

        connection.execute(text("ALTER TABLE customer_sessions MODIFY COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"))
        connection.execute(text("UPDATE customer_sessions SET status = UPPER(status) WHERE status IS NOT NULL"))
        connection.execute(text("ALTER TABLE customer_sessions MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'"))
        connection.execute(text("ALTER TABLE customer_sessions MODIFY COLUMN email VARCHAR(120) NOT NULL"))


def ensure_order_schema() -> None:
    """Bring pre-existing order tables in line with the current order contract."""
    with engine.begin() as connection:
        columns = {row[0] for row in connection.execute(text("SHOW COLUMNS FROM orders"))}

        if "sgst" not in columns:
            connection.execute(text("ALTER TABLE orders ADD COLUMN sgst DECIMAL(10, 2) NOT NULL DEFAULT 0"))
        if "cgst" not in columns:
            connection.execute(text("ALTER TABLE orders ADD COLUMN cgst DECIMAL(10, 2) NOT NULL DEFAULT 0"))
        if "estimated_cooking_time" not in columns:
            connection.execute(
                text("ALTER TABLE orders ADD COLUMN estimated_cooking_time INT NOT NULL DEFAULT 0")
            )

        connection.execute(
            text(
                "UPDATE orders SET status = 'ORDER_RECEIVED' "
                "WHERE status IS NULL OR LOWER(status) = 'pending'"
            )
        )
        connection.execute(
            text("ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'ORDER_RECEIVED'")
        )


def ensure_feedback_schema() -> None:
    """Bring pre-existing feedback tables in line with the feedback API contract."""
    with engine.begin() as connection:
        columns = {row[0] for row in connection.execute(text("SHOW COLUMNS FROM feedback"))}

        if "created_at" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE feedback ADD COLUMN created_at DATETIME "
                    "NOT NULL DEFAULT CURRENT_TIMESTAMP"
                )
            )

        has_unique_session_index = connection.execute(
            text(
                "SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS "
                "WHERE TABLE_SCHEMA = DATABASE() "
                "AND TABLE_NAME = 'feedback' "
                "AND COLUMN_NAME = 'session_id' "
                "AND NON_UNIQUE = 0 LIMIT 1"
            )
        ).scalar() is not None
        if not has_unique_session_index:
            connection.execute(
                text("ALTER TABLE feedback ADD CONSTRAINT uq_feedback_session_id UNIQUE (session_id)")
            )


def initialize_database() -> None:
    create_database_if_not_exists()
    Base.metadata.create_all(bind=engine)
    ensure_customer_session_schema()
    ensure_order_schema()
    ensure_feedback_schema()
<<<<<<< HEAD:backend/app/database.py
    print("Database tables ensured successfully.")
=======
    print("Database tables ensured successfully.")
>>>>>>> 463124af02341a26f11446ceb35802d78cace07e:app/database.py
