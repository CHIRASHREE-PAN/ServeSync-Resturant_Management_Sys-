from datetime import datetime

from sqlalchemy import create_engine, inspect, text

from app.config import get_settings

settings = get_settings()
engine = create_engine(settings.database_url, future=True)


def ensure_users_columns() -> None:
    inspector = inspect(engine)
    columns = {col["name"] for col in inspector.get_columns("users")}

    with engine.begin() as conn:
        if "is_active" not in columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE"))
        if "password" in columns:
            conn.execute(text("ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL"))


def ensure_otp_table() -> None:
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    if "otp" not in tables:
        with engine.begin() as conn:
            conn.execute(
                text(
                    """
                    CREATE TABLE otp (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        otp VARCHAR(6) NOT NULL,
                        expires_at TIMESTAMP NOT NULL,
                        is_used BOOLEAN NOT NULL DEFAULT FALSE,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    )
                    """
                )
            )


def seed_admin_user() -> None:
    with engine.begin() as conn:
        result = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": "adm.in@gmail.com"}).fetchone()
        if result is None:
            conn.execute(
                text(
                    """
                    INSERT INTO users (name, email, role, is_active, created_at)
                    VALUES (:name, :email, :role, :is_active, :created_at)
                    """
                ),
                {
                    "name": "Admin",
                    "email": "adm.in@gmail.com",
                    "role": "admin",
                    "is_active": True,
                    "created_at": datetime.utcnow(),
                },
            )
            print("seeded admin")
        else:
            print("admin already exists")


if __name__ == "__main__":
    ensure_users_columns()
    ensure_otp_table()
    seed_admin_user()
