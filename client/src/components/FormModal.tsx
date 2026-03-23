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

const TITLE_MAX = 100;
const CONTENT_MAX = 500;

type FieldErrors = Partial<Record<
  "firstName" | "lastName" | "email" | "password" | "title" | "content" | "dueDate",
  string
>>;

export default function FormModal({ isOpen, onClose, mode }: FormModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { user, setUser, setToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    // Reset errors when modal opens
    setServerError("");
    setFieldErrors({});

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};

    if (mode === "register") {
      if (!firstName.trim()) errors.firstName = "First name is required";
      if (!lastName.trim()) errors.lastName = "Last name is required";
    }

    if (mode === "login" || mode === "register") {
      if (!email.trim()) {
        errors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = "Enter a valid email address";
      }

      if (!password) {
        errors.password = "Password is required";
      } else if (mode === "register" && password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      }
    }

    if (mode === "newTask") {
      if (!title.trim()) {
        errors.title = "Title is required";
      } else if (title.trim().length > TITLE_MAX) {
        errors.title = `Title must be ${TITLE_MAX} characters or fewer`;
      }

      if (!content.trim()) {
        errors.content = "Content is required";
      } else if (content.trim().length > CONTENT_MAX) {
        errors.content = `Content must be ${CONTENT_MAX} characters or fewer`;
      }

      if (dueDate) {
        // Parse as local midnight to avoid UTC offset mismatch
        const selected = new Date(dueDate + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) {
          errors.dueDate = "Due date cannot be in the past";
        }
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      if (mode === "login" || mode === "register") {
        const endpoint =
          mode === "login" ? "/api/auth/login" : "/api/auth/register";
        const payload =
          mode === "login"
            ? { email: email.trim(), password }
            : { email: email.trim(), password, firstName: firstName.trim(), lastName: lastName.trim() };

        const response = await apiCall(endpoint, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          setServerError(data.message || "An error occurred. Please try again.");
          return;
        }

        setUser(data.user);
        setToken(data.token);
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        onClose();
        navigate("/tasks");
      } else if (mode === "newTask") {
        const response = await apiCall("/tasks", {
          method: "POST",
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            due_date: dueDate || null,
            user_id: user?.id,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          setServerError(data.message || "Failed to create task. Please try again.");
          return;
        }

        setTitle("");
        setContent("");
        setDueDate("");
        onClose();
        navigate("/tasks", { state: { refresh: Date.now() } });
      }
    } catch {
      setServerError("Network error. Please check your connection and try again.");
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

  const todayLocal = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  if (!isOpen) return null;

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

        <form onSubmit={handleSubmit} className="form-modal-form" noValidate>
          {/* Register name fields */}
          {mode === "register" && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); clearFieldError("firstName"); }}
                  placeholder="John"
                  className={fieldErrors.firstName ? "input-error" : ""}
                />
                {fieldErrors.firstName && (
                  <span className="field-error">{fieldErrors.firstName}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); clearFieldError("lastName"); }}
                  placeholder="Doe"
                  className={fieldErrors.lastName ? "input-error" : ""}
                />
                {fieldErrors.lastName && (
                  <span className="field-error">{fieldErrors.lastName}</span>
                )}
              </div>
            </div>
          )}

          {/* Auth email */}
          {isAuthMode && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                placeholder="you@example.com"
                className={fieldErrors.email ? "input-error" : ""}
                autoComplete="email"
              />
              {fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
            </div>
          )}

          {/* Auth password */}
          {isAuthMode && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
                placeholder="••••••••"
                className={fieldErrors.password ? "input-error" : ""}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              {fieldErrors.password && (
                <span className="field-error">{fieldErrors.password}</span>
              )}
              {mode === "register" && !fieldErrors.password && (
                <span className="field-hint">At least 8 characters</span>
              )}
            </div>
          )}

          {/* Task fields */}
          {mode === "newTask" && (
            <>
              <div className="form-group">
                <div className="form-label-row">
                  <label htmlFor="taskTitle">Title</label>
                  <span className={`char-count ${title.length > TITLE_MAX * 0.9 ? "char-count--warn" : ""}`}>
                    {title.length}/{TITLE_MAX}
                  </span>
                </div>
                <input
                  id="taskTitle"
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); clearFieldError("title"); }}
                  placeholder="Enter task title..."
                  maxLength={TITLE_MAX}
                  className={fieldErrors.title ? "input-error" : ""}
                />
                {fieldErrors.title && (
                  <span className="field-error">{fieldErrors.title}</span>
                )}
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label htmlFor="taskContent">Description</label>
                  <span className={`char-count ${content.length > CONTENT_MAX * 0.9 ? "char-count--warn" : ""}`}>
                    {content.length}/{CONTENT_MAX}
                  </span>
                </div>
                <textarea
                  id="taskContent"
                  value={content}
                  onChange={(e) => { setContent(e.target.value); clearFieldError("content"); }}
                  placeholder="Describe your task..."
                  rows={5}
                  maxLength={CONTENT_MAX}
                  className={fieldErrors.content ? "input-error" : ""}
                />
                {fieldErrors.content && (
                  <span className="field-error">{fieldErrors.content}</span>
                )}
              </div>

              <div className="form-group due-date-group">
                <label htmlFor="taskDueDate">Due Date <span className="field-optional">(optional)</span></label>
                <input
                  id="taskDueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDueDate(val);
                    if (val) {
                      const selected = new Date(val + "T00:00:00");
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (selected < today) {
                        setFieldErrors((prev) => ({ ...prev, dueDate: "Due date cannot be in the past" }));
                        return;
                      }
                    }
                    clearFieldError("dueDate");
                  }}
                  min={todayLocal}
                  className={fieldErrors.dueDate ? "input-error" : ""}
                />
                {fieldErrors.dueDate && (
                  <span className="field-error">{fieldErrors.dueDate}</span>
                )}
              </div>
            </>
          )}

          {serverError && (
            <div className="form-modal-error" role="alert">
              {serverError}
            </div>
          )}

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
