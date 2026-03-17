from __future__ import annotations

import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import get_settings
from app.core.db import get_db
from app.core.security import UTC, create_token, gen_otp, hash_password, mask_phone, normalize_phone, otp_hmac, verify_password
from fastapi import Depends

from app.middleware.auth import get_current_user
from app.schemas.auth import (
    LoginRequest,
    SignupManagerRequest,
    SignupTrainerRequest,
    SignupUserRequest,
)
from app.services.strip import strip_private_fields
from app.utils.email import send_otp_email
from app.utils.sms_2factor import send_otp_sms_2factor


router = APIRouter(tags=["auth"])


def new_id() -> str:
    return str(uuid.uuid4())


@router.post("/auth/login")
async def login(req: LoginRequest):
    db = get_db()
    email = req.email.strip().lower()
    password = req.password

    role = None
    user_id = None
    user_doc = None
    phone = None

    admin = await db.admin_users.find_one({"email": email})
    if admin:
        if not verify_password(password, admin.get("password_hash", "")):
            raise HTTPException(401, "Invalid email or password")
        role = "Admin"
        user_id = admin["id"]
        user_doc = admin
        phone = admin.get("phone", "")

    if not role:
        trainer = await db.trainers.find_one({"email": email})
        if trainer:
            if not verify_password(password, trainer.get("password_hash", "")):
                raise HTTPException(401, "Invalid email or password")
            role = "Trainer"
            user_id = trainer["id"]
            user_doc = trainer
            phone = trainer.get("phone", "")

    if not role:
        community = await db.communities.find_one({"manager_email": email})
        if community:
            if not verify_password(password, community.get("password_hash", "")):
                raise HTTPException(401, "Invalid email or password")
            role = "Manager"
            user_id = community["id"]
            user_doc = community
            phone = community.get("manager_phone", "")

    if not role:
        household = await db.households.find_one({"primary_email": email})
        if household:
            if not verify_password(password, household.get("password_hash", "")):
                raise HTTPException(401, "Invalid email or password")
            role = "User"
            user_id = household["id"]
            user_doc = household
            phone = household.get("primary_phone", "")

    if not role or not user_id or not user_doc:
        raise HTTPException(401, "No account found with this email address")
    if not phone:
        raise HTTPException(400, "No phone number registered for this account")

    challenge_id = new_id()
    otp = gen_otp()
    await db.sms_otp_challenges.insert_one(
        {
            "id": challenge_id,
            "phone": normalize_phone(phone),
            "role": role,
            "user_id": user_id,
            "otp_hash": otp_hmac(challenge_id, phone, otp),
            "expires_at": datetime.now(UTC) + timedelta(minutes=10),
            "attempts": 0,
            "used": False,
            "created_at": datetime.now(UTC),
        }
    )

    sms_sent = await send_otp_sms_2factor(phone, otp)
    resp = {
        "requires_2fa": True,
        "challenge_id": challenge_id,
        "masked_phone": mask_phone(phone),
        "sms_sent": sms_sent,
        "role": role,
    }
    settings = get_settings()
    if not settings.twofactor_api_key:
        resp["otp_dev"] = otp
    return resp


@router.post("/auth/signup")
async def signup_user(req: SignupUserRequest):
    db = get_db()
    email = req.email.strip().lower()
    if req.password != req.confirm_password:
        raise HTTPException(400, "Passwords do not match")
    if len(req.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    if not req.full_name.strip():
        raise HTTPException(400, "Full name is required")

    existing = await db.households.find_one({"primary_email": email})
    if existing:
        raise HTTPException(400, "An account with this email already exists")

    community = await db.communities.find_one({})
    if not community:
        raise HTTPException(500, "No community configured. Please contact admin.")

    package = await db.packages.find_one({"name": "Sport Basic", "is_active": True})
    if not package:
        package = await db.packages.find_one({"is_active": True})
    if not package:
        raise HTTPException(500, "No active packages configured. Please contact admin.")

    hh_id = new_id()
    household = {
        "id": hh_id,
        "community_id": community["id"],
        "flat_number": req.flat_number.strip().upper(),
        "primary_name": req.full_name.strip(),
        "primary_phone": normalize_phone(req.phone),
        "primary_email": email,
        "package_id": package["id"],
        "plan_type": "Individual",
        "total_members": 1,
        "is_active": True,
        "food_plan_active": False,
        "join_date": datetime.now(UTC).strftime("%Y-%m-%d"),
        "fcm_token": "",
        "password_hash": hash_password(req.password),
    }
    await db.households.insert_one(household)

    await db.members.insert_one(
        {
            "id": new_id(),
            "household_id": hh_id,
            "member_name": req.full_name.strip(),
            "age": 25,
            "relation": "Self",
            "is_primary": True,
            "assigned_sport": "Badminton",
            "is_active": True,
            "phone": household["primary_phone"],
        }
    )

    hh_clean = dict(household)
    hh_clean.pop("password_hash", None)
    hh_clean.pop("_id", None)
    hh_clean["package"] = strip_private_fields(dict(package))
    hh_clean["community"] = strip_private_fields(dict(community))

    return {"token": create_token(hh_id, "User"), "role": "User", "user_id": hh_id, "user_data": hh_clean}


@router.post("/auth/signup/trainer")
async def signup_trainer(req: SignupTrainerRequest):
    db = get_db()
    email = req.email.strip().lower()
    if req.password != req.confirm_password:
        raise HTTPException(400, "Passwords do not match")
    if len(req.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")

    existing = await db.trainers.find_one({"email": email})
    if existing:
        raise HTTPException(400, "A trainer with this email already exists")

    comm = await db.communities.find_one({"id": req.community_id})
    if not comm:
        raise HTTPException(404, "Community not found")

    trainer_id = new_id()
    trainer = {
        "id": trainer_id,
        "name": req.name.strip(),
        "phone": normalize_phone(req.phone),
        "email": email,
        "sport": req.sport.strip(),
        "certification": "",
        "experience_years": 0,
        "rating": 0,
        "salary": 0,
        "is_active": True,
        "community_id": req.community_id,
        "image_url": "https://i.pravatar.cc/150?img=11",
        "password_hash": hash_password(req.password),
    }
    await db.trainers.insert_one(trainer)
    return {"success": True, "trainer_id": trainer_id}


@router.post("/auth/signup/manager")
async def signup_manager(req: SignupManagerRequest):
    db = get_db()
    email = req.manager_email.strip().lower()
    if req.password != req.confirm_password:
        raise HTTPException(400, "Passwords do not match")
    if len(req.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")

    comm = await db.communities.find_one({"id": req.community_id})
    if not comm:
        raise HTTPException(404, "Community not found")

    # Minimal change: store manager credentials on the community record
    await db.communities.update_one(
        {"id": req.community_id},
        {
            "$set": {
                "manager_name": req.manager_name.strip(),
                "manager_phone": normalize_phone(req.manager_phone),
                "manager_email": email,
                "password_hash": hash_password(req.password),
            }
        },
    )
    return {"success": True, "community_id": req.community_id}


# Legacy phone -> email OTP flow (kept for compatibility)
class SendOTPReqLegacy(BaseModel):
    phone: str


class VerifyOTPReqLegacy(BaseModel):
    phone: str
    otp: str


@router.post("/auth/send-otp")
async def send_otp_legacy(req: SendOTPReqLegacy):
    db = get_db()
    phone = normalize_phone(req.phone)

    user_type = None
    user_id = None
    email = None

    trainer = await db.trainers.find_one({"phone": phone})
    if trainer:
        user_type = "Trainer"
        user_id = trainer["id"]
        email = trainer.get("email")

    if not user_type:
        community = await db.communities.find_one({"manager_phone": phone})
        if community:
            user_type = "Manager"
            user_id = community["id"]
            email = community.get("manager_email")

    if not user_type:
        admin = await db.admin_users.find_one({"phone": phone})
        if admin:
            user_type = "Admin"
            user_id = admin["id"]
            email = admin.get("email")

    if not user_type:
        household = await db.households.find_one({"primary_phone": phone})
        if household:
            user_type = "User"
            user_id = household["id"]
            email = household.get("primary_email")

    if not user_type:
        raise HTTPException(404, "Phone number not registered with WELLDHAN")
    if not email:
        raise HTTPException(400, "No email address registered for this account")

    otp = gen_otp()
    await db.otp_sessions.delete_many({"phone": phone})
    await db.otp_sessions.insert_one(
        {
            "id": new_id(),
            "phone": phone,
            "otp": otp,
            "email": email,
            "user_type": user_type,
            "user_id": user_id,
            "expires_at": datetime.now(UTC) + timedelta(minutes=10),
            "used": False,
        }
    )

    is_real_email = await send_otp_email(email, otp)
    masked = email[:3] + "***@" + email.split("@")[1] if "@" in email else "***"

    resp = {"success": True, "email_sent": is_real_email, "masked_email": masked, "user_type": user_type}
    settings = get_settings()
    if not settings.gmail_user:
        resp["otp_dev"] = otp
    return resp


@router.post("/auth/verify-otp")
async def verify_otp_legacy(req: VerifyOTPReqLegacy):
    db = get_db()
    phone = normalize_phone(req.phone)
    session = await db.otp_sessions.find_one({"phone": phone, "used": False})
    if not session:
        raise HTTPException(400, "No active OTP session. Please request a new OTP.")
    if datetime.now(UTC) > session["expires_at"].replace(tzinfo=UTC):
        raise HTTPException(400, "OTP has expired. Please request a new one.")
    if session["otp"] != req.otp.strip():
        raise HTTPException(400, "Invalid OTP. Please try again.")

    await db.otp_sessions.update_one({"_id": session["_id"]}, {"$set": {"used": True}})

    role = session["user_type"]
    user_id = session["user_id"]
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


@router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    db = get_db()
    role = current_user["role"]
    user_id = current_user["sub"]
    if role == "User":
        hh = await db.households.find_one({"id": user_id})
        if hh:
            pkg = await db.packages.find_one({"id": hh.get("package_id", "")})
            comm = await db.communities.find_one({"id": hh.get("community_id", "")})
            hh["package"] = strip_private_fields(pkg) if pkg else None
            hh["community"] = strip_private_fields(comm) if comm else None
            return strip_private_fields(hh)
    elif role == "Trainer":
        t = await db.trainers.find_one({"id": user_id})
        if t:
            return strip_private_fields(t)
    elif role == "Manager":
        c = await db.communities.find_one({"id": user_id})
        if c:
            return strip_private_fields(c)
    elif role == "Admin":
        a = await db.admin_users.find_one({"id": user_id})
        if a:
            return strip_private_fields(a)
    raise HTTPException(404, "User not found")

