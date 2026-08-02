from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.schemas.auth import RequestOtpRequest, RequestOtpResponse, VerifyOtpRequest, VerifyOtpResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/request-otp", response_model=RequestOtpResponse, status_code=status.HTTP_200_OK)
def request_otp(payload: RequestOtpRequest, db: Session = Depends(get_db)) -> RequestOtpResponse:
    result = AuthService(db).request_otp(payload.email)
    return RequestOtpResponse(**result)


@router.post("/verify-otp", response_model=VerifyOtpResponse, status_code=status.HTTP_200_OK)
def verify_otp(payload: VerifyOtpRequest, db: Session = Depends(get_db)) -> VerifyOtpResponse:
    result = AuthService(db).verify_otp(payload.email, payload.otp)
    return VerifyOtpResponse(**result)


@router.get("/me", response_model=dict, status_code=status.HTTP_200_OK)
def get_me(current_user=Depends(get_current_user)) -> dict:
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email, "role": current_user.role}
