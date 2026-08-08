from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Category, MenuItem


class CategoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, category_id: int) -> Category | None:
        return self.db.get(Category, category_id)

    def get_by_name(self, name: str) -> Category | None:
        return self.db.execute(
            select(Category).where(func.lower(Category.name) == name.strip().lower())
        ).scalar_one_or_none()

    def list_categories(self, *, page: int, page_size: int, search: str | None) -> tuple[list[Category], int]:
        statement = select(Category)
        count_statement = select(func.count(Category.id))

        if search and search.strip():
            search_value = f"%{search.strip().lower()}%"
            statement = statement.where(func.lower(Category.name).like(search_value))
            count_statement = count_statement.where(func.lower(Category.name).like(search_value))

        total_items = self.db.execute(count_statement).scalar_one()
        items = self.db.execute(
            statement.order_by(Category.name.asc()).offset((page - 1) * page_size).limit(page_size)
        ).scalars().all()
        return items, total_items

    def create(self, *, name: str, description: str | None) -> Category:
        category = Category(name=name, description=description)
        self.db.add(category)
        try:
            self.db.commit()
            self.db.refresh(category)
        except IntegrityError:
            self.db.rollback()
            raise
        return category

    def update(self, category: Category, **values: object) -> Category:
        for field, value in values.items():
            setattr(category, field, value)
        try:
            self.db.commit()
            self.db.refresh(category)
        except IntegrityError:
            self.db.rollback()
            raise
        return category

    def has_menu_items(self, category_id: int) -> bool:
        return self.db.execute(
            select(MenuItem.id).where(MenuItem.category_id == category_id).limit(1)
        ).scalar_one_or_none() is not None

    def delete(self, category: Category) -> None:
        self.db.delete(category)
        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise
