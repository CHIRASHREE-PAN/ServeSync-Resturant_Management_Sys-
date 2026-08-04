from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import require_waiter
from app.database import get_db
from app.models import User
from app.schemas.waiter import WaiterCallDetailResponse, WaiterNotificationResponse, WaiterOrderResponse
from app.services.waiter_service import WaiterService

router = APIRouter(prefix="/waiter", tags=["waiter"])


@router.get(
    "/orders",
    response_model=list[WaiterNotificationResponse],
    status_code=status.HTTP_200_OK,
    summary="List unread waiter notifications",
    description="Return unread notifications for orders that the kitchen has marked READY_TO_SERVE, oldest first.",
)
def list_unread_waiter_notifications(
    db: Session = Depends(get_db),
    _: User = Depends(require_waiter),
) -> list[WaiterNotificationResponse]:
    return WaiterService(db).list_unread_notifications()


@router.get(
    "/calls",
    response_model=list[WaiterCallDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="List open waiter calls",
    description="Return OPEN customer waiter calls only, oldest first.",
)
def list_open_waiter_calls(
    db: Session = Depends(get_db),
    _: User = Depends(require_waiter),
) -> list[WaiterCallDetailResponse]:
    return WaiterService(db).list_open_waiter_calls()


@router.put(
    "/orders/{order_id}/served",
    response_model=WaiterOrderResponse,
    status_code=status.HTTP_200_OK,
    summary="Mark an order as served",
    description="Move a READY_TO_SERVE order to SERVED and mark its waiter notification as read.",
)
def mark_order_served(
    order_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_waiter),
) -> WaiterOrderResponse:
    return WaiterService(db).mark_order_served(order_id)


@router.put(
    "/calls/{call_id}/completed",
    response_model=WaiterCallDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Complete a waiter call",
    description="Move an OPEN waiter call to COMPLETED.",
)
def complete_waiter_call(
    call_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_waiter),
) -> WaiterCallDetailResponse:
    return WaiterService(db).complete_waiter_call(call_id)
