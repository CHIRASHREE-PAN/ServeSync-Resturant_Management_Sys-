from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import CustomerSession, Order, OrderItem


class KitchenRepository:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _with_order_details(statement):
        return statement.options(
            joinedload(Order.session).joinedload(CustomerSession.table),
            selectinload(Order.order_items).joinedload(OrderItem.menu_item),
        )

    def list_active_kitchen_orders(self) -> list[Order]:
        statement = (
            select(Order)
            .where(Order.status.in_(["ORDER_RECEIVED", "PREPARING"]))
            .order_by(Order.created_at.asc(), Order.id.asc())
        )
        return self.db.execute(self._with_order_details(statement)).scalars().all()

    def get_order_for_update(self, order_id: int) -> Order | None:
        statement = select(Order).where(Order.id == order_id).with_for_update()
        return self.db.execute(self._with_order_details(statement)).scalar_one_or_none()

    def commit(self) -> None:
        self.db.commit()
