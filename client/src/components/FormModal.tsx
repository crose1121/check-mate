import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiCall } from "../lib/api";
import "./FormModal.css";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register" | "newTask";
}

export default function FormModal({ isOpen, onClose, mode }: FormModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, setUser, setToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "newTask" && dueDate) {
        // Validate due date is not in the past
        const selectedDate = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          setError("Due date cannot be in the past");
          setLoading(false);
          return;
        }
      }

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
          body: JSON.stringify({
            title,
            content,
            due_date: dueDate || null,
            user_id: user?.id,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.message || "Failed to create task");
          return;
        }

        // Reset form and close
        setTitle("");
        setContent("");
        setDueDate("");
        onClose();

        // Navigate to tasks page and signal a refresh
        navigate("/tasks", { state: { refresh: Date.now() } });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isAuthMode = mode === "login" || mode === "register";
  const headerCopy = {
    login: {
      title: "Welcome Back",
      subtitle: "Sign in to your account",
      submit: "Sign In",
    },
    register: {
      title: "Create Account",
      subtitle: "Join Check Mate Today",
      submit: "Create Account",
    },
    newTask: {
      title: "Create a New Task",
      subtitle: "Add a new task to your list",
      submit: "Save Task",
    },
  }[mode];

  if (!isOpen) {
    return null;
  }

  return (
    <div className="form-modal-overlay" onClick={onClose}>
      <div
        className="form-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="form-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="form-modal-header">
          <h2 id="form-modal-title">{headerCopy.title}</h2>
          <p className="form-modal-subtitle">{headerCopy.subtitle}</p>
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

              <div className="form-group due-date-group">
                <label htmlFor="taskDueDate">Due Date</label>
                <input
                  id="taskDueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })()}
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
            {loading ? "Loading..." : headerCopy.submit}
          </button>
        </form>

        {isAuthMode && (
          <div className="form-modal-footer">
            <p>
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <Link
                to={mode === "login" ? "/register" : "/login"}
                className="form-modal-toggle"
              >
                {mode === "login" ? "Register" : "Sign In"}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
