import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenLayout, Input, Button } from "../../components";
import api from "../../api/client";
import { useAuth } from "../../store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const submit = async () => {
    setError(null);
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setLoading(true);
    try {
      const resp = await api.auth.login({ email, password });
      if (resp && resp.requires_2fa && resp.challenge_id) {
        // store challenge and navigate to otp
        localStorage.setItem("challenge_id", resp.challenge_id);
        navigate("/auth/otp");
        setLoading(false);
        return;
      }
      // if token present
      if (resp && resp.token) {
        setAuth(resp.token, resp.role, resp.user_data);
        navigate("/");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <ScreenLayout title="Login">
      <div style={{ maxWidth: 520 }}>
        <Input
          label="Email"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
        />
        <div style={{ height: 12 }} />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
        />
        <div style={{ marginTop: 6, marginBottom: 6 }}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowPassword((s) => !s);
            }}
          >
            {showPassword ? "Hide password" : "Show password"}
          </a>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div style={{ marginTop: 12 }}>
          <Button variantType="primary" onClick={submit} disabled={loading}>
            {loading ? "Signing in..." : "Continue"}
          </Button>
        </div>
        <div style={{ marginTop: 12 }}>
          <small>
            Don't have an account?{" "}
            <a href="#" onClick={() => navigate("/auth/register")}>
              Create one
            </a>
          </small>
        </div>
      </div>
    </ScreenLayout>
  );
}
