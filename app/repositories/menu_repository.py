from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Category, MenuItem


class MenuRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_category_by_id(self, category_id: int) -> Category | None:
        return self.db.get(Category, category_id)

    def get_menu_by_id(self, menu_id: int) -> MenuItem | None:
        return self.db.get(MenuItem, menu_id)

    def get_menu_by_name(self, name: str) -> MenuItem | None:
        name_lower = name.strip().lower()
        return self.db.execute(select(MenuItem).where(func.lower(MenuItem.name) == name_lower)).scalar_one_or_none()

    def create_menu_item(
        self,
        *,
        category_id: int,
        name: str,
        description: str | None,
        price: float,
        image: str | None,
        calories: int | None,
        cook_time: int | None,
        availability: bool,
        chef_special: bool,
        best_seller: bool,
    ) -> MenuItem:
        menu_item = MenuItem(
            category_id=category_id,
            name=name,
            description=description,
            price=price,
            image=image,
            calories=calories,
            cook_time=cook_time,
            availability=availability,
            chef_special=chef_special,
            best_seller=best_seller,
        )
        self.db.add(menu_item)
        self.db.commit()
        self.db.refresh(menu_item)
        return menu_item

    def list_menu_items(
        self,
        *,
        page: int,
        page_size: int,
        search: str | None,
        category_id: int | None,
        chef_special: bool | None,
        best_seller: bool | None,
        sort_by: str,
        sort_dir: str,
    ) -> tuple[list[MenuItem], int]:
        statement = select(MenuItem).where(MenuItem.availability.is_(True))
        count_statement = select(func.count(MenuItem.id)).where(MenuItem.availability.is_(True))

        if search:
            search_value = f"%{search.lower()}%"
            statement = statement.where(func.lower(MenuItem.name).like(search_value))
            count_statement = count_statement.where(func.lower(MenuItem.name).like(search_value))

        if category_id is not None:
            statement = statement.where(MenuItem.category_id == category_id)
            count_statement = count_statement.where(MenuItem.category_id == category_id)

        if chef_special is not None:
            statement = statement.where(MenuItem.chef_special.is_(chef_special))
            count_statement = count_statement.where(MenuItem.chef_special.is_(chef_special))

        if best_seller is not None:
            statement = statement.where(MenuItem.best_seller.is_(best_seller))
            count_statement = count_statement.where(MenuItem.best_seller.is_(best_seller))

        if sort_by == "price":
            order_column = MenuItem.price
        elif sort_by == "name":
            order_column = MenuItem.name
        else:
            order_column = MenuItem.name

        if sort_dir == "desc":
            statement = statement.order_by(order_column.desc())
        else:
            statement = statement.order_by(order_column.asc())

        total_items = self.db.execute(count_statement).scalar_one()
        items = self.db.execute(statement.offset((page - 1) * page_size).limit(page_size)).scalars().all()
        return items, total_items

    def search_menu_items(self, query: str) -> list[MenuItem]:
        search_value = f"%{query.lower()}%"
        return self.db.execute(
            select(MenuItem).where(MenuItem.availability.is_(True), func.lower(MenuItem.name).like(search_value))
        ).scalars().all()

    def list_menu_items_by_category(self, category_id: int) -> list[MenuItem]:
        return self.db.execute(
            select(MenuItem).where(MenuItem.category_id == category_id, MenuItem.availability.is_(True))
        ).scalars().all()

    def update_menu_item(self, menu_item: MenuItem, **kwargs) -> MenuItem:
        for key, value in kwargs.items():
            if value is not None and hasattr(menu_item, key):
                setattr(menu_item, key, value)
        self.db.commit()
        self.db.refresh(menu_item)
        return menu_item

    def delete_menu_item(self, menu_item: MenuItem) -> None:
        self.db.delete(menu_item)
        self.db.commit()
