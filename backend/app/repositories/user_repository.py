from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> User | None:
        email_lower = email.lower()

        return self.db.execute(
            select(User).where(
                func.lower(User.email) == email_lower
            )
        ).scalar_one_or_none()

    def get_user_by_id(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def create_user(
        self,
        *,
        name: str,
        email: str,
        role: str,
        is_active: bool = True,
    ) -> User:
        user = User(
            name=name,
            email=email,
            role=role,
            is_active=is_active,
        )

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

        # IMPORTANT:
        # Only ACTIVE staff are returned to the frontend.
        # Inactive staff remain safely stored in the database.
        statement = select(User).where(
            User.is_active.is_(True)
        )

        count_statement = select(
            func.count(User.id)
        ).where(
            User.is_active.is_(True)
        )

        # Search only among active staff
        if search:
            search_value = f"%{search.lower()}%"

            search_filter = (
                func.lower(User.name).like(search_value)
                | func.lower(User.email).like(search_value)
            )

            statement = statement.where(search_filter)
            count_statement = count_statement.where(search_filter)

        # Filter by role
        if role:
            statement = statement.where(
                User.role == role
            )

            count_statement = count_statement.where(
                User.role == role
            )

        # Count only ACTIVE staff
        total_items = self.db.execute(
            count_statement
        ).scalar_one()

        # Fetch only ACTIVE staff
        items = self.db.execute(
            statement
            .order_by(User.id)
            .offset((page - 1) * page_size)
            .limit(page_size)
        ).scalars().all()

        return items, total_items

    def update_user(
        self,
        user: User,
        **kwargs,
    ) -> User:

        for key, value in kwargs.items():
            if value is not None and hasattr(user, key):
                setattr(user, key, value)

        self.db.commit()
        self.db.refresh(user)

        return user

    def soft_delete(
        self,
        user: User,
    ) -> None:

        # DO NOT physically delete the database row.
        # Just mark the staff member inactive.
        user.is_active = False

        self.db.commit()

    def count_active_admins(self) -> int:
        return self.db.execute(
            select(func.count(User.id)).where(
                User.role == "admin",
                User.is_active.is_(True),
            )
        ).scalar_one()