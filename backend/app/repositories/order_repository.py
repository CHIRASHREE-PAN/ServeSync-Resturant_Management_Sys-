from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import CustomerSession, MenuItem, Order, OrderItem


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _with_details(statement):
        return statement.options(
            selectinload(Order.session),
            selectinload(Order.order_items).selectinload(OrderItem.menu_item),
        )

    def get_session(self, session_id: int) -> CustomerSession | None:
        return self.db.get(CustomerSession, session_id)

    def get_menu_items(self, menu_item_ids: list[int]) -> list[MenuItem]:
        return self.db.execute(select(MenuItem).where(MenuItem.id.in_(menu_item_ids))).scalars().all()

    def get_order(self, order_id: int) -> Order | None:
        return self.db.execute(
            self._with_details(select(Order).where(Order.id == order_id))
        ).scalar_one_or_none()

    def get_orders_for_session(self, session_id: int) -> list[Order]:
        return self.db.execute(
            self._with_details(
                select(Order).where(Order.session_id == session_id).order_by(Order.created_at.desc(), Order.id.desc())
            )
        ).scalars().all()

    def save(self, order: Order) -> Order:
        self.db.add(order)
        self.db.commit()
        return self.get_order(order.id)  # type: ignore[return-value]

    def delete(self, order: Order) -> None:
        self.db.delete(order)
        self.db.commit()
