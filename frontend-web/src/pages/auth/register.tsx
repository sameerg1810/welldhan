import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenLayout, Input, Button } from "../../components";
import api from "../../api/client";
import { useAuth } from "../../store/authStore";

export default function Register() {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [flat_number, setFlatNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const submit = async () => {
    setError(null);
    if (!full_name) {
      setError("Please enter your full name.");
      return;
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const resp = await api.auth.signup({
        full_name,
        email,
        phone,
        password,
        confirm_password,
        flat_number,
      });
      if (resp && resp.token) {
        // store token and redirect
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
    <ScreenLayout title="Register">
      <div style={{ maxWidth: 520 }}>
        <Input
          label="Full name"
          value={full_name}
          onChange={(e: any) => setFullName(e.target.value)}
        />
        <div style={{ height: 8 }} />
        <Input
          label="Email"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
        />
        <div style={{ height: 8 }} />
        <Input
          label="Phone"
          value={phone}
          onChange={(e: any) => setPhone(e.target.value)}
        />
        <div style={{ height: 8 }} />
        <Input
          label="Flat / Apartment No. (optional)"
          value={flat_number}
          onChange={(e: any) => setFlatNumber(e.target.value)}
        />
        <div style={{ height: 8 }} />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
        />
        <div style={{ height: 8 }} />
        <Input
          label="Confirm password"
          type="password"
          value={confirm_password}
          onChange={(e: any) => setConfirmPassword(e.target.value)}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div style={{ marginTop: 12 }}>
          <Button variantType="primary" onClick={submit} disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </div>
        <div style={{ marginTop: 12 }}>
          <small>
            Already have an account?{" "}
            <a href="#" onClick={() => navigate("/auth/login")}>
              Sign in
            </a>
          </small>
        </div>
      </div>
    </ScreenLayout>
  );
}
