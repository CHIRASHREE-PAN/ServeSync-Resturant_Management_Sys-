import logging

from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models import Order, WaiterCall, WaiterNotification
from app.repositories.waiter_repository import WaiterRepository
from app.schemas.waiter import (
    WaiterCallDetailResponse,
    WaiterNotificationResponse,
    WaiterOrderedItemResponse,
    WaiterOrderResponse,
)

logger = logging.getLogger("restaurant_management.waiter")


class WaiterService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = WaiterRepository(db)

    def list_unread_notifications(self) -> list[WaiterNotificationResponse]:
        return [self._notification_to_response(notification) for notification in self.repo.list_unread_notifications()]

    def list_open_waiter_calls(self) -> list[WaiterCallDetailResponse]:
        return [self._call_to_response(waiter_call) for waiter_call in self.repo.list_open_waiter_calls()]

    def mark_order_served(self, order_id: int) -> WaiterOrderResponse:
        try:
            order = self.repo.get_order_for_update(order_id)
            if order is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
            if order.session is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer session not found.")
            if order.status != "READY_TO_SERVE":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Order must be in READY_TO_SERVE status to mark it as served.",
                )

            notification = self.repo.get_notification_for_order_for_update(order_id)
            if notification is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Waiter notification not found.")

            order.status = "SERVED"
            notification.is_read = True
            self.repo.commit()
            return self._order_to_response(order)
        except HTTPException:
            self.db.rollback()
            raise
        except SQLAlchemyError as exc:
            self.db.rollback()
            logger.exception("Unable to mark order %s as served", order_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to update order due to a database error.",
            ) from exc

    def complete_waiter_call(self, call_id: int) -> WaiterCallDetailResponse:
        try:
            waiter_call = self.repo.get_waiter_call_for_update(call_id)
            if waiter_call is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Waiter call not found.")
            if waiter_call.session is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer session not found.")
            if waiter_call.status != "OPEN":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Waiter call must be in OPEN status to mark it as completed.",
                )

            waiter_call.status = "COMPLETED"
            self.repo.commit()
            return self._call_to_response(waiter_call)
        except HTTPException:
            self.db.rollback()
            raise
        except SQLAlchemyError as exc:
            self.db.rollback()
            logger.exception("Unable to complete waiter call %s", call_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to update waiter call due to a database error.",
            ) from exc

    @staticmethod
    def _ordered_items(order: Order) -> list[WaiterOrderedItemResponse]:
        return [
            WaiterOrderedItemResponse(
                menu_item_name=item.menu_item.name,
                quantity=item.quantity,
                special_instruction=item.instruction,
            )
            for item in order.order_items
        ]

    @classmethod
    def _notification_to_response(cls, notification: WaiterNotification) -> WaiterNotificationResponse:
        order = notification.order
        return WaiterNotificationResponse(
            notification_id=notification.id,
            order_id=order.id,
            table_number=order.session.table.table_number,
            customer_name=order.session.name,
            order_status=order.status,
            ordered_items=cls._ordered_items(order),
            subtotal=order.subtotal,
            tax=order.tax,
            total=order.total,
            estimated_cooking_time=order.estimated_cooking_time,
            created_at=notification.created_at,
        )

    @classmethod
    def _order_to_response(cls, order: Order) -> WaiterOrderResponse:
        return WaiterOrderResponse(
            order_id=order.id,
            session_id=order.session_id,
            table_number=order.session.table.table_number,
            customer_name=order.session.name,
            order_status=order.status,
            ordered_items=cls._ordered_items(order),
            subtotal=order.subtotal,
            tax=order.tax,
            total=order.total,
            estimated_cooking_time=order.estimated_cooking_time,
            created_at=order.created_at,
        )

    @staticmethod
    def _call_to_response(waiter_call: WaiterCall) -> WaiterCallDetailResponse:
        customer_session = waiter_call.session
        return WaiterCallDetailResponse(
            call_id=waiter_call.id,
            session_id=waiter_call.session_id,
            table_number=customer_session.table.table_number,
            customer_name=customer_session.name,
            customer_email=customer_session.email,
            number_of_people=customer_session.number_of_people,
            status=waiter_call.status,
            created_at=waiter_call.created_at,
        )
