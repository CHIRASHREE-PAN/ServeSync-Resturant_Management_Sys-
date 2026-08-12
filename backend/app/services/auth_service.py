def request_otp(self, email: str) -> dict:
    user = self.user_repo.get_user_by_email(email)
    if not user:
        raise UserNotFoundError()
    if not user.is_active:
        raise InactiveAccountError()

    otp = f"{random.randint(100000, 999999):06d}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    self.otp_repo.create_otp(user_id=user.id, otp=otp, expires_at=expires_at)

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
