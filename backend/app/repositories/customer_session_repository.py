from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import CustomerSession, Table


class CustomerSessionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_table_by_number(self, table_number: int) -> Table | None:
        return self.db.execute(select(Table).where(Table.table_number == table_number)).scalar_one_or_none()

    def get_active_session_for_table(self, table_id: int) -> CustomerSession | None:
        return self.db.execute(
            select(CustomerSession).where(
                CustomerSession.table_id == table_id,
                CustomerSession.status == "ACTIVE",
            )
        ).scalar_one_or_none()

    def get_customer_session_by_id(self, session_id: int) -> CustomerSession | None:
        return self.db.get(CustomerSession, session_id)

    def create_customer_session(
        self,
        *,
        table_id: int,
        name: str,
        email: str,
        number_of_people: int,
    ) -> CustomerSession:
        customer_session = CustomerSession(
            session_id=str(uuid4()),
            table_id=table_id,
            name=name,
            email=email,
            number_of_people=number_of_people,
            status="ACTIVE",
        )
        self.db.add(customer_session)
        self.db.commit()
        self.db.refresh(customer_session)
        return customer_session

    def update_customer_session(self, customer_session: CustomerSession, **kwargs) -> CustomerSession:
        for key, value in kwargs.items():
            if value is not None and hasattr(customer_session, key):
                setattr(customer_session, key, value)
        self.db.commit()
        self.db.refresh(customer_session)
        return customer_session
