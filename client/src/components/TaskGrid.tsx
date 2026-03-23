import "./TaskGrid.css";
import { useAuth } from "../hooks/useAuth";
import { apiCall } from "../lib/api";

interface TaskGridProps {
  id: string;
  title: string;
  content: string;
  created_at: string;
  due_date?: string | null;
  updated_at?: string;
  is_completed: boolean;
  onSelect?: (task: TaskGridProps) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  dragOverId?: string | null;
  isDraggable?: boolean;
  showCheckmark?: boolean;
  suppressActionsUntil?: number;
  priorityIndex?: number;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function TaskGrid({
  id,
  title,
  content,
  created_at,
  due_date,
  updated_at,
  is_completed,
  onSelect,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  dragOverId,
  isDraggable = false,
  showCheckmark = false,
  suppressActionsUntil = 0,
  priorityIndex,
  onComplete,
  onDelete,
}: TaskGridProps) {
  const { user } = useAuth();
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const handleMarkComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (Date.now() < suppressActionsUntil) {
      return;
    }

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

      if (onComplete) {
        onComplete(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (Date.now() < suppressActionsUntil) {
      return;
    }

    try {
      const userId = user?.id;
      const endpoint = userId
        ? `/tasks/${id}?userId=${encodeURIComponent(userId)}`
        : `/tasks/${id}`;
      const response = await apiCall(endpoint, { method: "DELETE" });

      if (!response.ok) {
        console.error(`Delete failed with status ${response.status}`);
        throw new Error(`Server error: ${response.status}`);
      }

      if (onDelete) {
        onDelete(id);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div
      className={`task-grid-item ${is_completed ? "completed" : ""} ${isDragging ? "dragging" : ""} ${dragOverId === id ? "drag-over" : ""} ${priorityIndex ? "priority-on" : ""}`}
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && onDragStart?.(e, id)}
      onDragOver={(e) => isDraggable && onDragOver?.(e)}
      onDrop={(e) => isDraggable && onDrop?.(e, id)}
      onDragEnd={(e) => isDraggable && onDragEnd?.(e)}
      onClick={() =>
        onSelect?.({
          id,
          title,
          content,
          created_at,
          due_date,
          updated_at,
          is_completed,
        })
      }
    >
      {/* ── Header: priority · title · actions ── */}
      <div className="task-grid-header">
        {priorityIndex && (
          <div
            className={`task-grid-priority priority-${Math.min(priorityIndex, 6)}`}
          >
            {priorityIndex}
          </div>
        )}
        <h4 className="task-grid-title">{truncateText(title, 50)}</h4>
        <div className="task-grid-actions">
          {showCheckmark && (
            <button
              className={`task-grid-checkmark ${is_completed ? "is-complete" : ""}`}
              onClick={handleMarkComplete}
              title={is_completed ? "Mark as incomplete" : "Mark as complete"}
            >
              ✓
            </button>
          )}
          <button
            className="task-grid-delete"
            onClick={handleDelete}
            title="Delete task"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <p>{truncateText(content, 90)}</p>

      {/* ── Footer: date ── */}
      <div className="task-grid-footer">
        {is_completed ? (
          <>
            <small className="task-grid-completed-label">Task Completed</small>
            {updated_at && (
              <small className="completed-text">
                on {new Date(updated_at).toLocaleDateString()}
              </small>
            )}
          </>
        ) : (
          <small>
            {due_date
              ? `Due ${new Date(due_date).toLocaleDateString()}`
              : new Date(created_at).toLocaleDateString()}
          </small>
        )}
      </div>

      {dragOverId === id && isDraggable && (
        <div className="drop-indicator">↓ Drop here</div>
      )}
    </div>
  );
}
