import { createContext, type Dispatch, type SetStateAction } from "react";

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;

  setUser: Dispatch<SetStateAction<AuthUser | null>>;
  setToken: Dispatch<SetStateAction<string | null>>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
