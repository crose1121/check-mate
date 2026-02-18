import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiCall } from "../lib/api";
import "./FormModal.css";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register" | "newTask";
  onModeChange?: (mode: "login" | "register") => void;
}

export default function FormModal({
  isOpen,
  onClose,
  mode,
  onModeChange,
}: FormModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser, setToken } = useAuth();
  const navigate = useNavigate();

  const handleToggleAuthMode = () => {
    if (onModeChange) {
      onModeChange(mode === "login" ? "register" : "login");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login" || mode === "register") {
        // Handle auth
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
      } else if (mode === "newTask") {
        // Handle task creation
        const response = await apiCall("/tasks", {
          method: "POST",
          body: JSON.stringify({ title, content }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.message || "Failed to create task");
          return;
        }

        // Reset form and close
        setTitle("");
        setContent("");
        onClose();

        // Navigate to tasks page
        navigate("/tasks");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isAuthMode = mode === "login" || mode === "register";

  return (
    <div className="form-modal-overlay" onClick={onClose}>
      <div
        className="form-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="form-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="form-modal-header">
          <h2>
            {mode === "login"
              ? "Welcome Back"
              : mode === "register"
                ? "Create Account"
                : "Create a New Task"}
          </h2>
          <p className="form-modal-subtitle">
            {mode === "login"
              ? "Sign in to your account"
              : mode === "register"
                ? "Join Task Buddy today"
                : "Add a new task to your list"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-modal-form">
          {/* Auth Fields */}
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

          {isAuthMode && (
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
          )}

          {isAuthMode && (
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
          )}

          {/* Task Fields */}
          {mode === "newTask" && (
            <>
              <div className="form-group">
                <label htmlFor="taskTitle">Title</label>
                <input
                  id="taskTitle"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="taskContent">Content</label>
                <textarea
                  id="taskContent"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your task..."
                  rows={6}
                  required
                />
              </div>
            </>
          )}

          {error && <div className="form-modal-error">{error}</div>}

          <button
            type="submit"
            className="form-modal-submit"
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : mode === "login"
                ? "Sign In"
                : mode === "register"
                  ? "Create Account"
                  : "Save Task"}
          </button>
        </form>

        {isAuthMode && (
          <div className="form-modal-footer">
            <p>
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                className="form-modal-toggle"
                onClick={handleToggleAuthMode}
              >
                {mode === "login" ? "Register" : "Sign In"}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
