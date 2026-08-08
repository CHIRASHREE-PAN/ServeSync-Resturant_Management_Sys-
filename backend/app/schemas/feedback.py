from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FeedbackCreateRequest(BaseModel):
    session_id: int = Field(..., gt=0, description="Customer session primary key.")
    rating: int = Field(..., ge=1, le=5, description="Star rating from 1 through 5.")
    comment: str | None = Field(default=None, description="Optional customer feedback comment.")


class FeedbackCreateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    rating: int
    comment: str | None


class FeedbackDetailResponse(BaseModel):
    id: int
    session_id: int
    customer_name: str
    customer_email: str
    table_number: int
    rating: int
    comment: str | None
<<<<<<< HEAD:backend/app/schemas/feedback.py
    submitted_at: datetime
=======
    submitted_at: datetime
>>>>>>> 463124af02341a26f11446ceb35802d78cace07e:app/schemas/feedback.py
