import "./TaskGrid.css";

interface TaskGridProps {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  is_completed: boolean;
  onSelect?: (task: TaskGridProps) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, taskId: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: number) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  dragOverId?: number | null;
  isDraggable?: boolean;
  showCheckmark?: boolean;
  suppressActionsUntil?: number;
  priorityIndex?: number;
  onComplete?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function TaskGrid({
  id,
  title,
  content,
  created_at,
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
      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

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
      const response = await fetch(`http://localhost:4000/tasks/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

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
        onSelect?.({ id, title, content, created_at, updated_at, is_completed })
      }
    >
      {priorityIndex && (
        <div
          className={`task-grid-priority priority-${Math.min(priorityIndex, 6)}`}
        >
          {priorityIndex}
        </div>
      )}
      <button
        className="task-grid-delete"
        onClick={handleDelete}
        title="Delete task"
      >
        ✕
      </button>
      {showCheckmark && (
        <button
          className="task-grid-checkmark"
          onClick={handleMarkComplete}
          title={is_completed ? "Mark as incomplete" : "Mark as complete"}
        >
          ✓
        </button>
      )}
      <h4>{truncateText(title, 40)}</h4>
      <p>{truncateText(content, 85)}</p>
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
        <small>{new Date(created_at).toLocaleDateString()}</small>
      )}
      {dragOverId === id && isDraggable && (
        <div className="drop-indicator">↓ Drop here</div>
      )}
    </div>
  );
}
