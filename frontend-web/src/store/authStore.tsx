import React, { createContext, useContext, useEffect, useState } from "react";

type AuthState = {
  token: string | null;
  role?: string | null;
  user?: any | null;
  setAuth: (t: string | null, role?: string | null, user?: any | null) => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  const setAuth = (t: string | null, r?: string | null, u?: any | null) => {
    setToken(t);
    setRole(r || null);
    setUser(u || null);
  };

  return (
    <AuthContext.Provider value={{ token, role, user, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
