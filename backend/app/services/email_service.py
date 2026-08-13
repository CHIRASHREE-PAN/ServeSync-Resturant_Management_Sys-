from pathlib import Path
import base64

import resend

from app.config import get_settings


settings = get_settings()

resend.api_key = settings.resend_api_key


class EmailService:

    @staticmethod
    def send_otp_email(to_email: str, otp: str) -> None:
        params = {
            "from": "onboarding@resend.dev",
            "to": [to_email],
            "subject": "Your Restaurant OTP",
            "html": f"""
                <h2>Your Restaurant OTP</h2>
                <p>Your OTP is:</p>
                <h1>{otp}</h1>
                <p>This OTP expires in 5 minutes.</p>
            """,
        }

        resend.Emails.send(params)

    @staticmethod
    def send_invoice_email(
        to_email: str,
        invoice_path: Path,
        bill_id: int,
    ) -> None:

        # Convert PDF to Base64
        pdf_content = base64.b64encode(
            invoice_path.read_bytes()
        ).decode("utf-8")

        params = {
            "from": "onboarding@resend.dev",
            "to": [to_email],
            "subject": f"Restaurant Invoice #{bill_id}",
            "html": """
                <p>
                    Please find your restaurant invoice attached.
                    Thank you for dining with us.
                </p>
            """,
            "attachments": [
                {
                    "filename": invoice_path.name,
                    "content": pdf_content,
                }
            ],
        }

        resend.Emails.send(params)