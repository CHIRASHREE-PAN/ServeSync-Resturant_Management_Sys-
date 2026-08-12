import random
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.exceptions import (
    DuplicateEmailError,
    ExpiredOtpError,
    InactiveAccountError,
    InvalidOtpError,
    OtpAlreadyUsedError,
    SmtpDeliveryError,
    UserNotFoundError,
)
from app.core.security import create_access_token
from app.repositories.otp_repository import OTPRepository
from app.repositories.user_repository import UserRepository
from app.services.email_service import EmailService


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.otp_repo = OTPRepository(db)

    def request_otp(self, email: str) -> dict:
        user = self.user_repo.get_user_by_email(email)
        if not user:
            raise UserNotFoundError()
        if not user.is_active:
            raise InactiveAccountError()

        otp = f"{random.randint(100000, 999999):06d}"
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
        self.otp_repo.create_otp(
            user_id=user.id,
            otp=otp,
            expires_at=expires_at
        )

        # Always log OTP to console for development/testing
        print(f"\n{'='*70}")
        print(f"🔐 OTP REQUESTED")
        print(f"{'='*70}")
        print(f"📧 Email: {user.email}")
        print(f"🔢 OTP Code: {otp}")
        print(f"⏱️  Expires: 5 minutes")
        print(f"{'='*70}")
        print(f"💡 TIP: Use this OTP code to login: {otp}")
        print(f"{'='*70}\n")

        # Attempt to send email
        try:
            EmailService.send_otp_email(user.email, otp)
        except Exception as e:
            print(f"❌ OTP EMAIL ERROR: {repr(e)}")

        return {"message": "OTP sent successfully"}

    def verify_otp(self, email: str, otp: str) -> dict:
        user = self.user_repo.get_user_by_email(email)
        if not user:
            raise UserNotFoundError()
        if not user.is_active:
            raise InactiveAccountError()

        otp_record = self.otp_repo.get_latest_valid_otp(user.id, otp)
        if not otp_record:
            raise InvalidOtpError()
        if otp_record.is_used:
            raise OtpAlreadyUsedError()

        expires_at = otp_record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at < datetime.now(timezone.utc):
            raise ExpiredOtpError()

        try:
            token = create_access_token(
                user.id,
                user.name,
                user.email,
                user.role
            )
            self.otp_repo.delete_otp(otp_record.id)
            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

        return {
            "access_token": token,
            "token_type": "bearer",
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        }
