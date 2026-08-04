from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import CustomerSession, Order, OrderItem, WaiterCall, WaiterNotification


class WaiterRepository:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _with_order_details(statement):
        return statement.options(
            joinedload(Order.session).joinedload(CustomerSession.table),
            selectinload(Order.order_items).joinedload(OrderItem.menu_item),
        )

    @staticmethod
    def _with_notification_details(statement):
        return statement.options(
            joinedload(WaiterNotification.order)
            .joinedload(Order.session)
            .joinedload(CustomerSession.table),
            joinedload(WaiterNotification.order)
            .selectinload(Order.order_items)
            .joinedload(OrderItem.menu_item),
        )

    def list_unread_notifications(self) -> list[WaiterNotification]:
        statement = (
            select(WaiterNotification)
            .where(WaiterNotification.is_read.is_(False))
            .order_by(WaiterNotification.created_at.asc(), WaiterNotification.id.asc())
        )
        return self.db.execute(self._with_notification_details(statement)).scalars().all()

    def list_open_waiter_calls(self) -> list[WaiterCall]:
        return self.db.execute(
            select(WaiterCall)
            .options(joinedload(WaiterCall.session).joinedload(CustomerSession.table))
            .where(WaiterCall.status == "OPEN")
            .order_by(WaiterCall.created_at.asc(), WaiterCall.id.asc())
        ).scalars().all()

    def get_order_for_update(self, order_id: int) -> Order | None:
        statement = select(Order).where(Order.id == order_id).with_for_update()
        return self.db.execute(self._with_order_details(statement)).scalar_one_or_none()

    def get_notification_for_order_for_update(self, order_id: int) -> WaiterNotification | None:
        return self.db.execute(
            select(WaiterNotification)
            .where(WaiterNotification.order_id == order_id)
            .order_by(WaiterNotification.created_at.asc(), WaiterNotification.id.asc())
            .with_for_update()
        ).scalars().first()

    def get_waiter_call_for_update(self, call_id: int) -> WaiterCall | None:
        return self.db.execute(
            select(WaiterCall)
            .options(joinedload(WaiterCall.session).joinedload(CustomerSession.table))
            .where(WaiterCall.id == call_id)
            .with_for_update()
        ).scalar_one_or_none()

    def commit(self) -> None:
        self.db.commit()
