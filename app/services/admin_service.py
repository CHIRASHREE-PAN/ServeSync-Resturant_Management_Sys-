from sqlalchemy.orm import Session

from app.core.exceptions import DuplicateEmailError, ForbiddenError, UserNotFoundError
from app.models import User
from app.repositories.user_repository import UserRepository


class AdminService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def create_staff(self, *, name: str, email: str, role: str) -> User:
        if self.user_repo.get_user_by_email(email):
            raise DuplicateEmailError()
        return self.user_repo.create_user(name=name, email=email, role=role)

    def get_staff(self, staff_id: int) -> User:
        staff = self.user_repo.get_user_by_id(staff_id)
        if staff is None:
            raise UserNotFoundError()
        return staff

    def list_staff(self, *, page: int, page_size: int, search: str | None, role: str | None) -> tuple[list[User], int]:
        return self.user_repo.list_users(page=page, page_size=page_size, search=search, role=role)

    def update_staff(self, staff_id: int, *, name: str | None = None, email: str | None = None, role: str | None = None, is_active: bool | None = None) -> User:
        staff = self.user_repo.get_user_by_id(staff_id)
        if staff is None:
            raise UserNotFoundError()

        existing = self.user_repo.get_user_by_email(email) if email else None
        if existing and existing.id != staff_id:
            raise DuplicateEmailError()

        return self.user_repo.update_user(staff, name=name, email=email, role=role, is_active=is_active)

    def delete_staff(self, staff_id: int) -> None:
        staff = self.user_repo.get_user_by_id(staff_id)
        if staff is None:
            raise UserNotFoundError()
        if staff.role == "admin" and self.user_repo.count_active_admins() <= 1:
            raise ForbiddenError("Prevent deleting last active Admin")
        self.user_repo.soft_delete(staff)
