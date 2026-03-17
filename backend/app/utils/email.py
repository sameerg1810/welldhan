from __future__ import annotations

import asyncio
import logging
import smtplib
from concurrent.futures import ThreadPoolExecutor
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import get_settings


logger = logging.getLogger(__name__)


async def send_otp_email(to_email: str, otp: str) -> bool:
    settings = get_settings()
    if not settings.gmail_user or not settings.gmail_app_password:
        logger.info(f"[DEV MODE] EMAIL OTP for {to_email}: {otp}")
        return False

    msg = MIMEMultipart()
    msg["From"] = settings.gmail_user
    msg["To"] = to_email
    msg["Subject"] = "WELLDHAN — Your Login OTP"
    body = f"Your WELLDHAN login OTP is: {otp}. Expires in 10 minutes."
    msg.attach(MIMEText(body, "plain"))

    def _send():
        with smtplib.SMTP("smtp.gmail.com", 587) as s:
            s.ehlo()
            s.starttls()
            s.ehlo()
            s.login(settings.gmail_user, settings.gmail_app_password)
            s.send_message(msg)

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(ThreadPoolExecutor(max_workers=1), _send)
    return True

