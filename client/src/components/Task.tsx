import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiCall } from "../lib/api";

interface TaskProps {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  is_completed: boolean;
  onSelect?: (task: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at?: string;
    is_completed: boolean;
  }) => void;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function Task({
  id,
  title,
  content,
  created_at,
  updated_at,
  is_completed,
  onSelect,
  onComplete,
  onDelete,
}: TaskProps) {
  const { user } = useAuth();
  const date = new Date(created_at).toLocaleDateString();
  const [animationClass, setAnimationClass] = useState("");

  const abbreviateBody = (text: string) => {
    const maxLength = 100;
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect({ id, title, content, created_at, updated_at, is_completed });
    }
  };

  const handleMarkComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const newAnimClass = is_completed
      ? "completing-fail"
      : "completing-success";
    setAnimationClass(newAnimClass);

    try {
      const endpoint = is_completed
        ? `/tasks/${id}/uncomplete`
        : `/tasks/${id}/complete`;
      const userId = user?.id;
      const scopedEndpoint = userId
        ? `${endpoint}?userId=${encodeURIComponent(userId)}`
        : endpoint;
      const response = await apiCall(scopedEndpoint, { method: "PUT" });

      if (!response.ok) throw new Error("Failed to update task");

      if (!is_completed) {
        setTimeout(() => {
          if (onComplete) {
            onComplete(id);
          }
        }, 600);
      } else if (onComplete) {
        onComplete(id);
      }
    } catch (err) {
      console.error(err);
      setAnimationClass("");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const userId = user?.id;
      const endpoint = userId
        ? `/tasks/${id}?userId=${encodeURIComponent(userId)}`
        : `/tasks/${id}`;
      const response = await apiCall(endpoint, { method: "DELETE" });

      if (!response.ok) throw new Error("Failed to delete task");

      if (onDelete) {
        onDelete(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={`task-card ${is_completed ? "completed" : ""} ${animationClass}`}
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      {/* ── Header: title · actions ── */}
      <div className="task-card-header">
        <h3 className="task-card-title">{title}</h3>
        <div className="task-card-actions">
          <button
            className={`complete-btn ${is_completed ? "is-complete" : ""}`}
            onClick={handleMarkComplete}
            title={is_completed ? "Mark as incomplete" : "Mark as complete"}
          >
            ✓
          </button>
          <button
            className="task-delete-btn"
            onClick={handleDelete}
            title="Delete task"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <p>{abbreviateBody(content)}</p>

      {/* ── Footer ── */}
      <div className="task-card-footer">
        {is_completed ? (
          <>
            <small style={{ color: "#4caf50", fontWeight: 600 }}>
              Task Completed
            </small>
            {updated_at && (
              <small className="completed-text">
                on {new Date(updated_at).toLocaleDateString()}
              </small>
            )}
          </>
        ) : (
          <small>{date}</small>
        )}
      </div>
    </div>
  );
}
