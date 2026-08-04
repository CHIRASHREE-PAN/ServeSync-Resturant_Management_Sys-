from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class BillRequest(BaseModel):
    session_id: int = Field(..., gt=0)


class BilledOrderItemResponse(BaseModel):
    order_id: int
    menu_item_name: str
    quantity: int
    unit_price: Decimal
    item_total: Decimal


class BillResponse(BaseModel):
    bill_id: int
    session_id: int
    customer_name: str
    customer_email: str
    table_number: int
    ordered_items: list[BilledOrderItemResponse]
    subtotal: Decimal
    cgst: Decimal
    sgst: Decimal
    total_tax: Decimal
    grand_total: Decimal
    pdf_path: str | None
    is_paid: bool
    created_at: datetime
