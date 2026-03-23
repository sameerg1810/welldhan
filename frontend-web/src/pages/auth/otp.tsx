import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenLayout, Input, Button } from "../../components";
import api from "../../api/client";
import { useAuth } from "../../store/authStore";

export default function Otp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const submit = async () => {
    setError(null);
    const challenge_id = localStorage.getItem("challenge_id");
    if (!challenge_id) return setError("Missing challenge id");
    try {
      const resp = await api.auth.verifyOtp({ challenge_id, otp });
      if (resp && resp.token) {
        setAuth(resp.token, resp.role, resp.user_data);
        localStorage.removeItem("challenge_id");
        navigate("/");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  return (
    <ScreenLayout title="Verify OTP">
      <div style={{ maxWidth: 520 }}>
        <Input
          label="OTP"
          value={otp}
          onChange={(e: any) => setOtp(e.target.value)}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div style={{ marginTop: 12 }}>
          <Button variantType="primary" onClick={submit}>
            Verify
          </Button>
        </div>
      </div>
    </ScreenLayout>
  );
}
