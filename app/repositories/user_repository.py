from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> User | None:
        email_lower = email.lower()
        return self.db.execute(select(User).where(func.lower(User.email) == email_lower)).scalar_one_or_none()

    def get_user_by_id(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def create_user(self, *, name: str, email: str, role: str, is_active: bool = True) -> User:
        user = User(name=name, email=email, role=role, is_active=is_active)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def list_users(
        self,
        *,
        page: int,
        page_size: int,
        search: str | None = None,
        role: str | None = None,
    ) -> tuple[list[User], int]:
        statement = select(User)
        count_statement = select(func.count(User.id))

        if search:
            search_value = f"%{search.lower()}%"
            statement = statement.where((func.lower(User.name).like(search_value)) | (func.lower(User.email).like(search_value)))
            count_statement = count_statement.where((func.lower(User.name).like(search_value)) | (func.lower(User.email).like(search_value)))

        if role:
            statement = statement.where(User.role == role)
            count_statement = count_statement.where(User.role == role)

        total_items = self.db.execute(count_statement).scalar_one()
        items = self.db.execute(statement.order_by(User.id).offset((page - 1) * page_size).limit(page_size)).scalars().all()
        return items, total_items

    def update_user(self, user: User, **kwargs) -> User:
        for key, value in kwargs.items():
            if value is not None and hasattr(user, key):
                setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user

    def soft_delete(self, user: User) -> None:
        user.is_active = False
        self.db.commit()

    def count_active_admins(self) -> int:
        return self.db.execute(select(func.count(User.id)).where(User.role == "admin", User.is_active.is_(True))).scalar_one()
