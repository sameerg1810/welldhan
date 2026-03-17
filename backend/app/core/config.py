from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parents[2]  # backend/
load_dotenv(ROOT_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    mongo_url: str
    db_name: str

    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_days: int = 30

    gmail_user: str = ""
    gmail_app_password: str = ""

    otp_hmac_secret: str = ""

    twofactor_api_key: str = ""
    twofactor_otp_template: str = ""
    twofactor_otp_sender: str = ""


def get_settings() -> Settings:
    mongo_url = os.environ["MONGO_URL"]
    db_name = os.environ.get("DB_NAME", "welldhan_db")

    jwt_secret = os.environ.get("JWT_SECRET", "welldhan-secret-key")
    otp_hmac_secret = os.environ.get("OTP_HMAC_SECRET", jwt_secret)

    return Settings(
        mongo_url=mongo_url,
        db_name=db_name,
        jwt_secret=jwt_secret,
        gmail_user=os.environ.get("GMAIL_USER", ""),
        gmail_app_password=os.environ.get("GMAIL_APP_PASSWORD", ""),
        otp_hmac_secret=otp_hmac_secret,
        twofactor_api_key=os.environ.get("TWOFACTOR_API_KEY", ""),
        twofactor_otp_template=os.environ.get("TWOFACTOR_OTP_TEMPLATE", ""),
        twofactor_otp_sender=os.environ.get("TWOFACTOR_OTP_SENDER", ""),
    )

