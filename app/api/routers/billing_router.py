from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.database import get_db
from app.models import User
from app.schemas.billing import BillRequest, BillResponse
from app.services.billing_service import BillingService

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post(
    "/request",
    response_model=BillResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate and email a bill",
    description="Generate a PDF invoice for an ACTIVE customer session, email it to the customer, and create an unpaid bill.",
)
def request_bill(
    payload: BillRequest,
    db: Session = Depends(get_db),
) -> BillResponse:
    return BillingService(db).request_bill(payload.session_id)


@router.get(
    "/{session_id}",
    response_model=BillResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a bill by customer session",
    description="Return the generated bill, customer details, ordered items, payment status, and invoice path.",
)
def get_bill(
    session_id: int,
    db: Session = Depends(get_db),
) -> BillResponse:
    return BillingService(db).get_bill(session_id)


@router.put(
    "/{bill_id}/paid",
    response_model=BillResponse,
    status_code=status.HTTP_200_OK,
    summary="Mark a bill as paid",
    description="Mark an unpaid bill as paid and complete its related customer session.",
)
def mark_bill_paid(
    bill_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin", "waiter")),
) -> BillResponse:
    return BillingService(db).mark_bill_paid(bill_id)