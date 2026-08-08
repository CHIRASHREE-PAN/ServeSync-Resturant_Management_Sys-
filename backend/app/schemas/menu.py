from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class MenuItemCreateRequest(BaseModel):
    category_id: int = Field(..., gt=0)
    name: str = Field(..., min_length=1, max_length=150)
    description: str | None = None
    price: Decimal = Field(..., gt=0)
    calories: int | None = Field(default=None, ge=0)
    cook_time: int | None = Field(default=None, gt=0)
    availability: bool = True
    chef_special: bool = False
    best_seller: bool = False


class MenuItemUpdateRequest(BaseModel):
    category_id: int | None = Field(default=None, gt=0)
    name: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = None
    price: Decimal | None = Field(default=None, gt=0)
    calories: int | None = Field(default=None, ge=0)
    cook_time: int | None = Field(default=None, gt=0)
    availability: bool | None = None
    chef_special: bool | None = None
    best_seller: bool | None = None


class MenuItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category_id: int
    name: str
    description: str | None = None
    price: Decimal
    image: str | None = None
    calories: int | None = None
    cook_time: int | None = None
    availability: bool
    chef_special: bool
    best_seller: bool


class MenuItemListResponse(MenuItemResponse):
    pass