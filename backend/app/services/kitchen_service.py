import logging
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models import Order, WaiterNotification
from app.repositories.kitchen_repository import KitchenRepository
from app.schemas.kitchen import KitchenOrderItemResponse, KitchenOrderResponse

logger = logging.getLogger("restaurant_management.kitchen")


class KitchenService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = KitchenRepository(db)

    def list_orders(self) -> list[KitchenOrderResponse]:
        return [self._to_response(order) for order in self.repo.list_active_kitchen_orders()]

    def mark_preparing(self, order_id: int) -> KitchenOrderResponse:
        return self._update_status(
            order_id=order_id,
            expected_status="ORDER_RECEIVED",
            next_status="PREPARING",
        )

    def mark_ready(self, order_id: int) -> KitchenOrderResponse:
        return self._update_status(
            order_id=order_id,
            expected_status="PREPARING",
            next_status="READY_TO_SERVE",
            notify_waiter=True,
        )

    def _update_status(
        self,
        *,
        order_id: int,
        expected_status: str,
        next_status: str,
        notify_waiter: bool = False,
    ) -> KitchenOrderResponse:
        try:
            order = self.repo.get_order_for_update(order_id)
            if order is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
            if order.status != expected_status:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Order must be in {expected_status} status to update it.",
                )

            order.status = next_status
            if notify_waiter:
                # Explicitly set created_at to avoid database schema mismatch
                created_at = datetime.now(timezone.utc)
                order.waiter_notifications.append(WaiterNotification(is_read=False, created_at=created_at))
            self.repo.commit()
            return self._to_response(order)
        except HTTPException:
            self.db.rollback()
            raise
        except SQLAlchemyError as exc:
            self.db.rollback()
            logger.exception("Unable to update kitchen order %s", order_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to update order due to a database error.",
            ) from exc

    @staticmethod
    def _to_response(order: Order) -> KitchenOrderResponse:
        return KitchenOrderResponse(
            order_id=order.id,
            session_id=order.session_id,
            table_number=order.session.table.table_number,
            customer_name=order.session.name,
            status=order.status,
            estimated_cooking_time=order.estimated_cooking_time,
            created_at=order.created_at,
            items=[
                KitchenOrderItemResponse(
                    menu_item_name=item.menu_item.name,
                    quantity=item.quantity,
                    special_instruction=item.instruction,
                )
                for item in order.order_items
            ],
        )
