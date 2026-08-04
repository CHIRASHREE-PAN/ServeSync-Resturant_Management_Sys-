from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class WaiterOrderedItemResponse(BaseModel):
    menu_item_name: str
    quantity: int
    special_instruction: str | None


class WaiterNotificationResponse(BaseModel):
    notification_id: int
    order_id: int
    table_number: int
    customer_name: str
    order_status: str
    ordered_items: list[WaiterOrderedItemResponse]
    subtotal: Decimal
    tax: Decimal
    total: Decimal
    estimated_cooking_time: int
    created_at: datetime


class WaiterOrderResponse(BaseModel):
    order_id: int
    session_id: int
    table_number: int
    customer_name: str
    order_status: str
    ordered_items: list[WaiterOrderedItemResponse]
    subtotal: Decimal
    tax: Decimal
    total: Decimal
    estimated_cooking_time: int
    created_at: datetime


class WaiterCallDetailResponse(BaseModel):
    call_id: int
    session_id: int
    table_number: int
    customer_name: str
    customer_email: str
    number_of_people: int
    status: str
    created_at: datetime
