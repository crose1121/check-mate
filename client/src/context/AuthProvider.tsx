import { useState } from "react";
import { AuthContext, type AuthContextValue } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [token, setToken] = useState<string | null>(null);

  const value: AuthContextValue = {
    user,
    token,
    setUser,
    setToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
