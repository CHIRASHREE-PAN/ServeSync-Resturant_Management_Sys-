from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import Bill, CustomerSession, Order, OrderItem


class BillingRepository:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _with_session_details(statement):
        return statement.options(
            joinedload(CustomerSession.table),
            selectinload(CustomerSession.orders)
            .selectinload(Order.order_items)
            .joinedload(OrderItem.menu_item),
        )

    @staticmethod
    def _with_bill_details(statement):
        return statement.options(
            joinedload(Bill.session).joinedload(CustomerSession.table),
            joinedload(Bill.session)
            .selectinload(CustomerSession.orders)
            .selectinload(Order.order_items)
            .joinedload(OrderItem.menu_item),
        )

    def get_session_for_update(self, session_id: int) -> CustomerSession | None:
        statement = select(CustomerSession).where(CustomerSession.id == session_id).with_for_update()
        return self.db.execute(self._with_session_details(statement)).scalar_one_or_none()

    def get_bill_by_session_id(self, session_id: int) -> Bill | None:
        statement = select(Bill).where(Bill.session_id == session_id)
        return self.db.execute(self._with_bill_details(statement)).scalar_one_or_none()

    def get_bill_for_update(self, bill_id: int) -> Bill | None:
        statement = select(Bill).where(Bill.id == bill_id).with_for_update()
        return self.db.execute(self._with_bill_details(statement)).scalar_one_or_none()

    def create_bill(self, *, session_id: int, subtotal, tax, total) -> Bill:
        # Explicitly set created_at to avoid database schema mismatch
        created_at = datetime.now(timezone.utc)
        bill = Bill(
            session_id=session_id,
            subtotal=subtotal,
            tax=tax,
            total=total,
            is_paid=False,
            created_at=created_at,
        )
        self.db.add(bill)
        self.db.flush()
        return bill

    def commit(self) -> None:
        self.db.commit()
