import logging

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.exceptions import (
    CustomerSessionNotFoundError,
    DatabaseOperationError,
    InvalidCustomerSessionStateError,
    WaiterCallConflictError,
    WaiterCallNotFoundError,
)
from app.models import WaiterCall
from app.repositories.waiter_call_repository import WaiterCallRepository

logger = logging.getLogger("restaurant_management.waiter_call")


class WaiterCallService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = WaiterCallRepository(db)

    def create_waiter_call(self, session_id: int) -> WaiterCall:
        customer_session = self.repo.get_customer_session(session_id)
        if customer_session is None:
            raise CustomerSessionNotFoundError("Customer session not found.")
        if customer_session.status != "ACTIVE":
            raise InvalidCustomerSessionStateError(
                "Waiter calls can only be created for an ACTIVE customer session."
            )
        if self.repo.get_open_waiter_call_for_session(session_id) is not None:
            raise WaiterCallConflictError()

        try:
            waiter_call = self.repo.create_waiter_call(session_id)
        except SQLAlchemyError as exc:
            self.db.rollback()
            logger.exception("Unable to create waiter call for customer session %s", session_id)
            raise DatabaseOperationError("Unable to create waiter call due to a database error.") from exc

        logger.info("Waiter call created: waiter_call_id=%s session_id=%s", waiter_call.id, session_id)
        return waiter_call

    def get_waiter_call(self, waiter_call_id: int) -> WaiterCall:
        waiter_call = self.repo.get_waiter_call(waiter_call_id)
        if waiter_call is None:
            raise WaiterCallNotFoundError("Waiter call not found.")
        return waiter_call
