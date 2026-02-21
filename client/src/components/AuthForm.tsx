import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiCall } from "../lib/api";
import "./AuthForm.css";

interface AuthFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export default function AuthForm({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser, setToken } = useAuth();
  const navigate = useNavigate();

  const handleToggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email, password }
          : { email, password, firstName, lastName };

      const response = await apiCall(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "An error occurred");
        return;
      }

      // Store user and token in context
      setUser(data.user);
      setToken(data.token);

      // Reset form and close
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      onClose();

      // Navigate to tasks page after successful login/registration
      navigate("/tasks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-form-container" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>
          ×
        </button>

        <div className="auth-header">
          <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Sign in to your account"
              : "Join Task Buddy today"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? "Loading..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              className="auth-toggle"
              onClick={handleToggleMode}
            >
              {mode === "login" ? "Register" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
