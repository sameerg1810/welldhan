from __future__ import annotations

from pydantic import BaseModel


class Send2FASmsOtpReq(BaseModel):
    challenge_id: str


class Verify2FASmsOtpReq(BaseModel):
    challenge_id: str
    otp: str

