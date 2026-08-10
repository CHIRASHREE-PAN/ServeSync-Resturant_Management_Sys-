import logging
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP

from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models import Order, OrderItem
from app.repositories.order_repository import OrderRepository
from app.schemas.order import OrderCreateRequest, OrderItemResponse, OrderResponse

logger = logging.getLogger("restaurant_management.order")

TAX_RATE = Decimal("0.025")
MONEY_QUANTUM = Decimal("0.01")


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = OrderRepository(db)

    def create_order(self, payload: OrderCreateRequest) -> OrderResponse:
        menu_item_ids = [item.menu_item_id for item in payload.items]
        if len(menu_item_ids) != len(set(menu_item_ids)):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Duplicate menu_item_id values are not allowed.")

        customer_session = self.repo.get_session(payload.session_id)
        if customer_session is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer session not found.")
        if customer_session.status != "ACTIVE":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Orders can only be placed for an ACTIVE customer session.")

        menu_items = self.repo.get_menu_items(menu_item_ids)
        menu_items_by_id = {menu_item.id: menu_item for menu_item in menu_items}
        for menu_item_id in menu_item_ids:
            menu_item = menu_items_by_id.get(menu_item_id)
            if menu_item is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Menu item {menu_item_id} not found.")
            if not menu_item.availability:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Menu item {menu_item_id} is unavailable.")

        subtotal = sum(
            (Decimal(str(menu_items_by_id[item.menu_item_id].price)) * item.quantity for item in payload.items),
            Decimal("0"),
        ).quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)
        sgst = (subtotal * TAX_RATE).quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)
        cgst = (subtotal * TAX_RATE).quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)
        tax = sgst + cgst
        total = subtotal + tax
        estimated_cooking_time = max(
            (menu_items_by_id[item.menu_item_id].cook_time or 0 for item in payload.items), default=0
        )

        # Explicitly set created_at to avoid database schema mismatch
        created_at = datetime.now(timezone.utc)
        order = Order(
            session_id=customer_session.id,
            status="ORDER_RECEIVED",
            subtotal=subtotal,
            sgst=sgst,
            cgst=cgst,
            tax=tax,
            total=total,
            estimated_cooking_time=estimated_cooking_time,
            created_at=created_at,
        )
        order.order_items = [
            OrderItem(
                menu_item_id=item.menu_item_id,
                quantity=item.quantity,
                price=menu_items_by_id[item.menu_item_id].price,
                instruction=item.special_instruction,
            )
            for item in payload.items
        ]
        try:
            saved_order = self.repo.save(order)
        except SQLAlchemyError as exc:
            self.db.rollback()
            logger.exception("Unable to create order for customer session %s", payload.session_id)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to create order due to a database error.") from exc
        return self._to_response(saved_order)

    def get_order(self, order_id: int) -> OrderResponse:
        order = self.repo.get_order(order_id)
        if order is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
        return self._to_response(order)

    def get_orders_for_session(self, session_id: int) -> list[OrderResponse]:
        if self.repo.get_session(session_id) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer session not found.")
        return [self._to_response(order) for order in self.repo.get_orders_for_session(session_id)]

    def delete_order(self, order_id: int) -> dict:
        order = self.repo.get_order(order_id)
        if order is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
        if order.status != "ORDER_RECEIVED":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only ORDER_RECEIVED orders can be deleted.")
        try:
            self.repo.delete(order)
        except SQLAlchemyError as exc:
            self.db.rollback()
            logger.exception("Unable to delete order %s", order_id)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unable to delete order due to a database error.") from exc
        return {"message": "Order deleted successfully."}

    @staticmethod
    def _to_response(order: Order) -> OrderResponse:
        customer_session = order.session
        return OrderResponse(
            id=order.id,
            session_id=order.session_id,
            customer_session=customer_session,
            status=order.status,
            subtotal=order.subtotal,
            sgst=order.sgst,
            cgst=order.cgst,
            tax=order.tax,
            total=order.total,
            estimated_cooking_time=order.estimated_cooking_time,
            created_at=order.created_at,
            items=[
                OrderItemResponse(
                    id=item.id,
                    menu_item_id=item.menu_item_id,
                    quantity=item.quantity,
                    price=item.price,
                    special_instruction=item.instruction,
                    menu_item=item.menu_item,
                )
                for item in order.order_items
            ],
        )
