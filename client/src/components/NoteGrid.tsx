import "./NoteGrid.css";

interface NoteGridProps {
  id: number;
  title: string;
  body: string;
  created_at: string;
  completed: boolean;
  onSelect?: (note: NoteGridProps) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, noteId: number) => void;
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

export default function NoteGrid({
  id,
  title,
  body,
  created_at,
  completed,
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
}: NoteGridProps) {
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
      const endpoint = completed
        ? `/notes/${id}/uncomplete`
        : `/notes/${id}/complete`;
      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to update note");

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
      const response = await fetch(`http://localhost:4000/notes/${id}`, {
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
      className={`note-grid-item ${completed ? "completed" : ""} ${isDragging ? "dragging" : ""} ${dragOverId === id ? "drag-over" : ""} ${priorityIndex ? "priority-on" : ""}`}
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && onDragStart?.(e, id)}
      onDragOver={(e) => isDraggable && onDragOver?.(e)}
      onDrop={(e) => isDraggable && onDrop?.(e, id)}
      onDragEnd={(e) => isDraggable && onDragEnd?.(e)}
      onClick={() => onSelect?.({ id, title, body, created_at, completed })}
    >
      {priorityIndex && (
        <div
          className={`note-grid-priority priority-${Math.min(priorityIndex, 6)}`}
        >
          {priorityIndex}
        </div>
      )}
      <button
        className="note-grid-delete"
        onClick={handleDelete}
        title="Delete note"
      >
        ✕
      </button>
      {showCheckmark && (
        <button
          className="note-grid-checkmark"
          onClick={handleMarkComplete}
          title={completed ? "Mark as incomplete" : "Mark as complete"}
        >
          ✓
        </button>
      )}
      <h4>{truncateText(title, 40)}</h4>
      <p>{truncateText(body, 85)}</p>
      <small>{new Date(created_at).toLocaleDateString()}</small>
      {dragOverId === id && isDraggable && (
        <div className="drop-indicator">↓ Drop here</div>
      )}
    </div>
  );
}
