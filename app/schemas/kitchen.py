from datetime import datetime

from pydantic import BaseModel


class KitchenOrderItemResponse(BaseModel):
    menu_item_name: str
    quantity: int
    special_instruction: str | None


class KitchenOrderResponse(BaseModel):
    order_id: int
    session_id: int
    table_number: int
    customer_name: str
    status: str
    estimated_cooking_time: int
    created_at: datetime
    items: list[KitchenOrderItemResponse]
