from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import require_kitchen
from app.database import get_db
from app.models import User
from app.schemas.kitchen import KitchenOrderResponse
from app.services.kitchen_service import KitchenService

router = APIRouter(prefix="/kitchen", tags=["kitchen"])


@router.get("/orders", response_model=list[KitchenOrderResponse], status_code=status.HTTP_200_OK)
def list_kitchen_orders(
    db: Session = Depends(get_db),
    _: User = Depends(require_kitchen),
) -> list[KitchenOrderResponse]:
    return KitchenService(db).list_orders()


@router.put("/orders/{order_id}/preparing", response_model=KitchenOrderResponse, status_code=status.HTTP_200_OK)
def mark_order_preparing(
    order_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_kitchen),
) -> KitchenOrderResponse:
    return KitchenService(db).mark_preparing(order_id)


@router.put("/orders/{order_id}/ready", response_model=KitchenOrderResponse, status_code=status.HTTP_200_OK)
def mark_order_ready(
    order_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_kitchen),
) -> KitchenOrderResponse:
    return KitchenService(db).mark_ready(order_id)
