from __future__ import annotations

from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class SignupUserRequest(BaseModel):
    full_name: str
    email: str
    password: str
    confirm_password: str
    phone: str
    flat_number: str


class SignupTrainerRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    confirm_password: str
    sport: str
    community_id: str


class SignupManagerRequest(BaseModel):
    manager_name: str
    manager_email: str
    manager_phone: str
    password: str
    confirm_password: str
    community_id: str

