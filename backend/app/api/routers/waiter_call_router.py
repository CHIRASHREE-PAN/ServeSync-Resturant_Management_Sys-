from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_waiter_call_service
from app.database import get_db
from app.schemas.waiter_call import WaiterCallCreateRequest, WaiterCallResponse
from app.services.waiter_call_service import WaiterCallService

router = APIRouter(prefix="/customer", tags=["waiter-call"])


@router.post(
    "/waiter-call",
    response_model=WaiterCallResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a waiter call",
    description="Create an OPEN waiter call for an ACTIVE customer session. Customers do not authenticate for this endpoint.",
)
def create_waiter_call(
    payload: WaiterCallCreateRequest,
    db: Session = Depends(get_db),
    service: WaiterCallService = Depends(get_waiter_call_service),
) -> WaiterCallResponse:
    waiter_call = service.create_waiter_call(payload.session_id)
    return WaiterCallResponse.model_validate(waiter_call)


@router.get(
    "/waiter-call/{id}",
    response_model=WaiterCallResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a waiter call",
    description="Fetch a waiter call by its primary key id. Customers do not authenticate for this endpoint.",
)
def get_waiter_call(
    id: int,
    db: Session = Depends(get_db),
    service: WaiterCallService = Depends(get_waiter_call_service),
) -> WaiterCallResponse:
    waiter_call = service.get_waiter_call(id)
    return WaiterCallResponse.model_validate(waiter_call)
