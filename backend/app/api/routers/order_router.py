from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.order import OrderCreateRequest, OrderDeleteResponse, OrderResponse
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreateRequest, db: Session = Depends(get_db)) -> OrderResponse:
    return OrderService(db).create_order(payload)


@router.get("/session/{session_id}", response_model=list[OrderResponse], status_code=status.HTTP_200_OK)
def get_orders_for_session(session_id: int, db: Session = Depends(get_db)) -> list[OrderResponse]:
    return OrderService(db).get_orders_for_session(session_id)


@router.get("/{id}", response_model=OrderResponse, status_code=status.HTTP_200_OK)
def get_order(id: int, db: Session = Depends(get_db)) -> OrderResponse:
    return OrderService(db).get_order(id)


@router.delete("/{id}", response_model=OrderDeleteResponse, status_code=status.HTTP_200_OK)
def delete_order(id: int, db: Session = Depends(get_db)) -> OrderDeleteResponse:
    return OrderDeleteResponse(**OrderService(db).delete_order(id))
