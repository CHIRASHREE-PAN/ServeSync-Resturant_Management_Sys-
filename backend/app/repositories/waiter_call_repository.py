from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import CustomerSession, WaiterCall


class WaiterCallRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_customer_session(self, session_id: int) -> CustomerSession | None:
        return self.db.get(CustomerSession, session_id)

    def get_waiter_call(self, waiter_call_id: int) -> WaiterCall | None:
        return self.db.get(WaiterCall, waiter_call_id)

    def get_open_waiter_call_for_session(self, session_id: int) -> WaiterCall | None:
        return self.db.execute(
            select(WaiterCall).where(
                WaiterCall.session_id == session_id,
                WaiterCall.status == "OPEN",
            )
        ).scalar_one_or_none()

    def create_waiter_call(self, session_id: int) -> WaiterCall:
        # Explicitly set created_at to avoid database schema mismatch
        created_at = datetime.now(timezone.utc)
        waiter_call = WaiterCall(session_id=session_id, status="OPEN", created_at=created_at)
        self.db.add(waiter_call)
        self.db.commit()
        self.db.refresh(waiter_call)
        return waiter_call
