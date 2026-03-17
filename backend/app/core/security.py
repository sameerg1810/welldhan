from __future__ import annotations

import hashlib
import hmac
import random
import string
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings


UTC = timezone.utc
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)
    except Exception:
        return False


def gen_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def normalize_phone(phone: str) -> str:
    return phone.strip().replace("+91", "").replace(" ", "").replace("-", "")


def mask_phone(phone: str) -> str:
    digits = "".join([c for c in phone if c.isdigit()])
    if len(digits) < 6:
        return "***"
    return f"{digits[:2]}******{digits[-2:]}"


def otp_hmac(challenge_id: str, phone: str, otp: str) -> str:
    settings = get_settings()
    msg = f"{challenge_id}|{normalize_phone(phone)}|{otp.strip()}".encode("utf-8")
    return hmac.new(settings.otp_hmac_secret.encode("utf-8"), msg, hashlib.sha256).hexdigest()


def create_token(sub: str, role: str) -> str:
    settings = get_settings()
    payload = {
        "sub": sub,
        "role": role,
        "iat": datetime.now(UTC),
        "exp": datetime.now(UTC) + timedelta(days=settings.jwt_expire_days),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    settings = get_settings()
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


__all__ = [
    "JWTError",
    "UTC",
    "create_token",
    "decode_token",
    "gen_otp",
    "hash_password",
    "mask_phone",
    "normalize_phone",
    "otp_hmac",
    "verify_password",
]

