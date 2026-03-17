from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException

from app.core.config import get_settings
from app.core.db import get_db
from app.core.security import UTC, gen_otp, mask_phone, otp_hmac
from app.schemas.twofa import Send2FASmsOtpReq, Verify2FASmsOtpReq
from app.services.strip import strip_private_fields
from app.utils.sms_2factor import send_otp_sms_2factor
from app.core.security import create_token


router = APIRouter(tags=["2fa"])


@router.post("/2fa/sms/send-otp")
async def send_2fa_sms_otp(req: Send2FASmsOtpReq):
    db = get_db()
    ch = await db.sms_otp_challenges.find_one({"id": req.challenge_id, "used": False})
    if not ch:
        raise HTTPException(404, "No active 2FA challenge. Please login again.")
    if datetime.now(UTC) > ch["expires_at"].replace(tzinfo=UTC):
        raise HTTPException(400, "Challenge expired. Please login again.")

    otp = gen_otp()
    await db.sms_otp_challenges.update_one(
        {"_id": ch["_id"]},
        {
            "$set": {
                "otp_hash": otp_hmac(ch["id"], ch["phone"], otp),
                "expires_at": datetime.now(UTC) + timedelta(minutes=10),
                "attempts": 0,
                "created_at": datetime.now(UTC),
            }
        },
    )

    sms_sent = await send_otp_sms_2factor(ch["phone"], otp)
    resp = {"success": True, "challenge_id": ch["id"], "masked_phone": mask_phone(ch["phone"]), "sms_sent": sms_sent}
    settings = get_settings()
    if not settings.twofactor_api_key:
        resp["otp_dev"] = otp
    return resp


@router.post("/2fa/sms/verify-otp")
async def verify_2fa_sms_otp(req: Verify2FASmsOtpReq):
    db = get_db()
    ch = await db.sms_otp_challenges.find_one({"id": req.challenge_id, "used": False})
    if not ch:
        raise HTTPException(400, "No active 2FA challenge. Please login again.")
    if datetime.now(UTC) > ch["expires_at"].replace(tzinfo=UTC):
        raise HTTPException(400, "OTP has expired. Please login again.")
    if ch.get("attempts", 0) >= 5:
        raise HTTPException(429, "Too many attempts. Please login again.")

    expected = ch.get("otp_hash", "")
    got = otp_hmac(ch["id"], ch["phone"], req.otp)
    import hmac as _hmac

    if not _hmac.compare_digest(expected, got):
        await db.sms_otp_challenges.update_one({"_id": ch["_id"]}, {"$inc": {"attempts": 1}})
        raise HTTPException(400, "Invalid OTP. Please try again.")

    await db.sms_otp_challenges.update_one({"_id": ch["_id"]}, {"$set": {"used": True}})

    role = ch["role"]
    user_id = ch["user_id"]
    token = create_token(user_id, role)

    user_data = None
    if role == "User":
        hh = await db.households.find_one({"id": user_id})
        if hh:
            pkg = await db.packages.find_one({"id": hh.get("package_id", "")})
            comm = await db.communities.find_one({"id": hh.get("community_id", "")})
            hh["package"] = strip_private_fields(pkg) if pkg else None
            hh["community"] = strip_private_fields(comm) if comm else None
            user_data = strip_private_fields(hh)
    elif role == "Trainer":
        t = await db.trainers.find_one({"id": user_id})
        if t:
            user_data = strip_private_fields(t)
    elif role == "Manager":
        c = await db.communities.find_one({"id": user_id})
        if c:
            user_data = strip_private_fields(c)
    elif role == "Admin":
        a = await db.admin_users.find_one({"id": user_id})
        if a:
            user_data = strip_private_fields(a)

    return {"token": token, "role": role, "user_id": user_id, "user_data": user_data}

