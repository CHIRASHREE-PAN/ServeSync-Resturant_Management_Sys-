from datetime import datetime
from decimal import Decimal

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class OrderItemCreateRequest(BaseModel):
    menu_item_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)
    special_instruction: str | None = Field(default=None, max_length=1000)


class OrderCreateRequest(BaseModel):
    session_id: int = Field(..., gt=0)
    items: list[OrderItemCreateRequest] = Field(
        ...,
        min_length=1,
        validation_alias=AliasChoices("items", "menu_items"),
    )


class OrderCustomerSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: str
    table_id: int
    name: str
    email: str
    number_of_people: int
    status: str
    started_at: datetime
    ended_at: datetime | None


class OrderedMenuItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    image: str | None
    cook_time: int | None


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    menu_item_id: int
    quantity: int
    price: Decimal
    special_instruction: str | None
    menu_item: OrderedMenuItemResponse


class OrderResponse(BaseModel):
    id: int
    session_id: int
    customer_session: OrderCustomerSessionResponse
    status: str
    subtotal: Decimal
    sgst: Decimal
    cgst: Decimal
    tax: Decimal
    total: Decimal
    estimated_cooking_time: int
    created_at: datetime
    items: list[OrderItemResponse]


class OrderDeleteResponse(BaseModel):
    message: str
