from app.database import SessionLocal
from app.models import User


def seed_default_admin() -> None:
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "admin@restaurant.local").first()
        if existing:
            print("Default admin already exists.")
            return
        admin = User(name="Admin", email="admin@restaurant.local", role="admin", is_active=True)
        db.add(admin)
        db.commit()
        print("Seeded default admin user.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_default_admin()
