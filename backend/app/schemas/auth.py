from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RequestOtpRequest(BaseModel):
    email: EmailStr


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


class RequestOtpResponse(BaseModel):
    message: str


class VerifyOtpResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: EmailStr
    role: str
