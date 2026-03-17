from __future__ import annotations

import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor

import requests

from app.core.config import get_settings
from app.core.security import normalize_phone


logger = logging.getLogger(__name__)


async def send_otp_sms_2factor(to_phone: str, otp: str) -> bool:
    """
    Transactional SMS OTP route using 2Factor.in.
    Returns True if it was actually sent. Returns False in dev/no-config mode.
    """
    settings = get_settings()
    phone = normalize_phone(to_phone)
    if not settings.twofactor_api_key or not settings.twofactor_otp_template:
        logger.info(f"[DEV MODE] SMS OTP for {phone}: {otp}")
        return False

    url = f"https://2factor.in/API/V1/{settings.twofactor_api_key}/SMS/{phone}/{otp}/{settings.twofactor_otp_template}"
    if settings.twofactor_otp_sender:
        url = url + f"?From={settings.twofactor_otp_sender}"

    def _send():
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json()
        if str(data.get("Status", "")).lower() != "success":
            raise RuntimeError(f"2Factor send failed: {data}")
        return True

    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(ThreadPoolExecutor(max_workers=1), _send)
        return True
    except Exception as e:
        logger.exception(f"2Factor SMS send error: {e}")
        return False

