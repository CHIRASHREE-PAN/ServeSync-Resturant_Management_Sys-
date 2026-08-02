import smtplib
import ssl
from email.message import EmailMessage

from app.config import get_settings

settings = get_settings()


class EmailService:
    @staticmethod
    def send_otp_email(to_email: str, otp: str) -> None:
        msg = EmailMessage()
        msg["Subject"] = "Your Restaurant OTP"
        msg["From"] = settings.smtp_username
        msg["To"] = to_email
        msg.set_content(f"Your OTP is: {otp}\nIt expires in 5 minutes.")

        context = ssl.create_default_context()
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls(context=context)
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)
