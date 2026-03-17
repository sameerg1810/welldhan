from __future__ import annotations

from typing import Optional

from fastapi import Depends, Header, HTTPException

from app.core.security import JWTError, decode_token


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid token")
    try:
        return decode_token(authorization.split(" ")[1])
    except JWTError:
        raise HTTPException(401, "Invalid token")


def require_roles(*roles: str):
    async def _dep(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user.get("role") not in roles:
            raise HTTPException(403, "Forbidden")
        return current_user

    return _dep

