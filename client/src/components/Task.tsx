import { useState } from "react";

interface TaskProps {
  id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at?: string;
  completed: boolean;
  onSelect?: (task: {
    id: number;
    title: string;
    body: string;
    created_at: string;
    updated_at?: string;
    completed: boolean;
  }) => void;
  onComplete?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function Task({
  id,
  title,
  body,
  created_at,
  updated_at,
  completed,
  onSelect,
  onComplete,
  onDelete,
}: TaskProps) {
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
      onSelect({ id, title, body, created_at, updated_at, completed });
    }
  };

  const handleMarkComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const newAnimClass = completed ? "completing-fail" : "completing-success";
    setAnimationClass(newAnimClass);

    try {
      const endpoint = completed
        ? `/tasks/${id}/uncomplete`
        : `/tasks/${id}/complete`;
      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to update task");

      if (!completed) {
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
      const response = await fetch(`http://localhost:4000/tasks/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

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
      className={`task-card ${completed ? "completed" : ""} ${animationClass}`}
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <button
        className="task-delete-btn"
        onClick={handleDelete}
        title="Delete task"
      >
        ✕
      </button>
      <button
        className="complete-btn"
        onClick={handleMarkComplete}
        title={completed ? "Mark as incomplete" : "Mark as complete"}
      >
        ✓
      </button>
      <h3>{title}</h3>
      <p>{abbreviateBody(body)}</p>
      {completed ? (
        <>
          <small style={{ color: "#4caf50", fontWeight: 600 }}>
            Task Completed
          </small>
          {updated_at && (
            <small className="completed-text">
              Completed on {new Date(updated_at).toLocaleDateString()}
            </small>
          )}
        </>
      ) : (
        <small>{date}</small>
      )}
    </div>
  );
}
