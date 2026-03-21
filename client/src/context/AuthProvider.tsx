import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useState,
} from "react";
import { AuthContext, type AuthContextValue } from "./AuthContext";

const SESSION_DURATION_MS = 60 * 60 * 1000;
const AUTH_USER_KEY = "authUser";
const AUTH_TOKEN_KEY = "authToken";
const SESSION_STARTED_AT_KEY = "authSessionStartedAt";

type InitialAuthState = {
  user: AuthContextValue["user"];
  token: string | null;
  sessionStartedAt: number | null;
};

function clearStoredAuth() {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(SESSION_STARTED_AT_KEY);
}

function getInitialAuthState(): InitialAuthState {
  const storedUser = localStorage.getItem(AUTH_USER_KEY);
  const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const storedSessionStartedAt = localStorage.getItem(SESSION_STARTED_AT_KEY);

  if (!(storedUser && storedToken && storedSessionStartedAt)) {
    if (storedUser || storedToken || storedSessionStartedAt) {
      clearStoredAuth();
    }

    return { user: null, token: null, sessionStartedAt: null };
  }

  const parsedSessionStartedAt = Number(storedSessionStartedAt);
  const sessionAge = Date.now() - parsedSessionStartedAt;

  if (
    !Number.isFinite(parsedSessionStartedAt) ||
    sessionAge >= SESSION_DURATION_MS
  ) {
    clearStoredAuth();
    return { user: null, token: null, sessionStartedAt: null };
  }

  try {
    return {
      user: JSON.parse(storedUser),
      token: storedToken,
      sessionStartedAt: parsedSessionStartedAt,
    };
  } catch {
    clearStoredAuth();
    return { user: null, token: null, sessionStartedAt: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialAuthState] = useState(getInitialAuthState);
  const [user, setUser] = useState<AuthContextValue["user"]>(
    initialAuthState.user,
  );
  const [tokenState, setTokenState] = useState<string | null>(
    initialAuthState.token,
  );
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(
    initialAuthState.sessionStartedAt,
  );

  const setToken: Dispatch<SetStateAction<string | null>> = (value) => {
    setTokenState((previousToken) => {
      const nextToken =
        typeof value === "function" ? value(previousToken) : value;

      if (!nextToken) {
        setSessionStartedAt(null);
        localStorage.removeItem(SESSION_STARTED_AT_KEY);
        return null;
      }

      setSessionStartedAt((previousStartedAt) => {
        const nextStartedAt = previousStartedAt ?? Date.now();
        localStorage.setItem(SESSION_STARTED_AT_KEY, String(nextStartedAt));
        return nextStartedAt;
      });

      return nextToken;
    });
  };

  const token = tokenState;
  const isLoading = false;

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [user]);

  // Persist token to localStorage whenever it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }, [token]);

  // Auto-expire active session after 1 hour
  useEffect(() => {
    if (!token || sessionStartedAt === null) return;

    const remainingTime = SESSION_DURATION_MS - (Date.now() - sessionStartedAt);
    const timeoutId = window.setTimeout(
      () => {
        setUser(null);
        setToken(null);
      },
      Math.max(0, remainingTime),
    );

    return () => window.clearTimeout(timeoutId);
  }, [token, sessionStartedAt]);

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    setUser,
    setToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
