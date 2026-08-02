from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import OTP


class OTPRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_otp(self, *, user_id: int, otp: str, expires_at: datetime) -> OTP:
        otp_record = OTP(user_id=user_id, otp=otp, expires_at=expires_at, is_used=False)
        self.db.add(otp_record)
        self.db.commit()
        self.db.refresh(otp_record)
        return otp_record

    def get_latest_valid_otp(self, user_id: int, otp: str) -> OTP | None:
        statement = (
            select(OTP)
            .where(OTP.user_id == user_id, OTP.otp == otp)
            .order_by(OTP.created_at.desc())
        )
        return self.db.execute(statement).scalar_one_or_none()

    def mark_used(self, otp_record: OTP) -> None:
        otp_record.is_used = True
        self.db.commit()
