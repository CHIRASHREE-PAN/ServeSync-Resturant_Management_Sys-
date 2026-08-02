from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class StaffCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    role: str = Field(..., pattern="^(admin|kitchen|waiter)$")


class StaffUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    email: EmailStr | None = None
    role: str | None = Field(default=None, pattern="^(admin|kitchen|waiter)$")
    is_active: bool | None = None


class StaffResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime
