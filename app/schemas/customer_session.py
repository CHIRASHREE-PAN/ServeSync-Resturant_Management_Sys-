from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CustomerSessionCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    number_of_people: int = Field(..., gt=0)
    table_number: int = Field(..., gt=0)


class CustomerSessionUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    email: EmailStr | None = None
    number_of_people: int | None = Field(default=None, gt=0)
    table_number: int | None = Field(default=None, gt=0)


class CustomerSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: str
    table_id: int
    table_number: int
    name: str
    email: EmailStr
    number_of_people: int
    status: str
    started_at: datetime
    ended_at: datetime | None = None
