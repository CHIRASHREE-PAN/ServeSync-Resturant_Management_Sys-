from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WaiterCallCreateRequest(BaseModel):
    session_id: int = Field(..., gt=0)


class WaiterCallResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    status: str
    created_at: datetime
