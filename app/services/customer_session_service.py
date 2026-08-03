import logging
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy.orm import Session

from app.core.exceptions import (
    CustomerSessionNotFoundError,
    InvalidCustomerSessionStateError,
    TableNotFoundError,
    TableSessionConflictError,
)
from app.models import CustomerSession
from app.repositories.customer_session_repository import CustomerSessionRepository

logger = logging.getLogger("restaurant_management.customer_session")


class CustomerSessionService:
    def __init__(self, db: Session):
        self.db = db
        self.customer_session_repo = CustomerSessionRepository(db)

    def create_customer_session(
        self,
        *,
        name: str,
        email: str,
        number_of_people: int,
        table_number: int,
    ) -> CustomerSession:
        table = self.customer_session_repo.get_table_by_number(table_number)
        if table is None:
            raise TableNotFoundError(f"Table {table_number} does not exist")

        active_session = self.customer_session_repo.get_active_session_for_table(table.id)
        if active_session is not None:
            raise TableSessionConflictError(
                f"Table {table_number} already has an ACTIVE customer session"
            )

        customer_session = self.customer_session_repo.create_customer_session(
            table_id=table.id,
            name=name,
            email=email,
            number_of_people=number_of_people,
        )
        logger.info(
            "Customer session created: session_id=%s table_id=%s name=%s",
            customer_session.session_id,
            customer_session.table_id,
            customer_session.name,
        )
        return customer_session

    def get_customer_session(self, session_id: int) -> CustomerSession:
        customer_session = self.customer_session_repo.get_customer_session_by_id(session_id)
        if customer_session is None:
            raise CustomerSessionNotFoundError(f"Customer session {session_id} was not found")
        return customer_session

    def update_customer_session(
        self,
        session_id: int,
        *,
        name: str | None = None,
        email: str | None = None,
        number_of_people: int | None = None,
        table_number: int | None = None,
    ) -> CustomerSession:
        customer_session = self.get_customer_session(session_id)
        if customer_session.status != "ACTIVE":
            raise InvalidCustomerSessionStateError(
                "Only ACTIVE customer sessions can be updated"
            )

        if table_number is not None:
            table = self.customer_session_repo.get_table_by_number(table_number)
            if table is None:
                raise TableNotFoundError(f"Table {table_number} does not exist")

            existing_active_session = self.customer_session_repo.get_active_session_for_table(table.id)
            if existing_active_session is not None and existing_active_session.id != customer_session.id:
                raise TableSessionConflictError(
                    f"Table {table_number} already has an ACTIVE customer session"
                )

            customer_session.table_id = table.id

        update_payload = {
            "name": name,
            "email": email,
            "number_of_people": number_of_people,
        }
        updated_customer_session = self.customer_session_repo.update_customer_session(
            customer_session,
            **update_payload,
        )
        logger.info(
            "Customer session updated: session_id=%s table_id=%s",
            updated_customer_session.session_id,
            updated_customer_session.table_id,
        )
        return updated_customer_session
