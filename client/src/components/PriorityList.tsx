import { useEffect, useState } from "react";
import Modal from "./Modal";
import { useAuth } from "../hooks/useAuth";
import { apiCall } from "../lib/api";
import { getPriorityOrder, setPriorityOrder } from "../lib/priorityUtils";
import type { Task as TaskType } from "../types";
import "./PriorityList.css";

const getUpdatedTime = (task: TaskType) =>
  new Date(task.updated_at ?? task.created_at).getTime();

const persistPriorityOrder = (orderedTasks: TaskType[]) => {
  setPriorityOrder(orderedTasks.map((task) => task.id));
};

const sortByPriority = (tasks: TaskType[], order: string[]) => {
  if (order.length === 0) {
    return [...tasks].sort((a, b) => getUpdatedTime(b) - getUpdatedTime(a));
  }
  const orderMap = new Map(order.map((id, index) => [id, index]));
  return [...tasks].sort((a, b) => {
    const aIndex = orderMap.get(a.id);
    const bIndex = orderMap.get(b.id);
    if (aIndex !== undefined || bIndex !== undefined) {
      if (aIndex === undefined) return 1;
      if (bIndex === undefined) return -1;
      return aIndex - bIndex;
    }
    return getUpdatedTime(b) - getUpdatedTime(a);
  });
};

const truncate = (text: string, max: number) =>
  text.length > max ? text.substring(0, max) + "…" : text;

export default function PriorityList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userId = user?.id;
        const endpoint = userId
          ? `/tasks/active?userId=${encodeURIComponent(userId)}`
          : "/tasks/active";
        const response = await apiCall(endpoint);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        const order = getPriorityOrder();
        setTasks(sortByPriority(data, order));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user?.id]);

  // ── Drag handlers ───────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId === null || draggedId === targetId) return;

    const draggedIndex = tasks.findIndex((t) => t.id === draggedId);
    const targetIndex = tasks.findIndex((t) => t.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const next = [...tasks];
    const [moved] = next.splice(draggedIndex, 1);
    next.splice(targetIndex, 0, moved);

    setTasks(next);
    persistPriorityOrder(next);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // ── Task actions ────────────────────────────────────────
  const handleComplete = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    try {
      const userId = user?.id;
      const endpoint = userId
        ? `/tasks/${taskId}/complete?userId=${encodeURIComponent(userId)}`
        : `/tasks/${taskId}/complete`;
      const response = await apiCall(endpoint, { method: "PUT" });
      if (!response.ok) throw new Error("Failed to complete task");
      const next = tasks.filter((t) => t.id !== taskId);
      setTasks(next);
      persistPriorityOrder(next);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    try {
      const userId = user?.id;
      const endpoint = userId
        ? `/tasks/${taskId}?userId=${encodeURIComponent(userId)}`
        : `/tasks/${taskId}`;
      const response = await apiCall(endpoint, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete task");
      const next = tasks.filter((t) => t.id !== taskId);
      setTasks(next);
      persistPriorityOrder(next);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Render ──────────────────────────────────────────────
  if (loading)
    return <p className="priority-state">Loading…</p>;
  if (error)
    return <p className="priority-state">Error: {error}</p>;
  if (tasks.length === 0)
    return (
      <p className="priority-empty">
        No active tasks yet — create some to start building your priority list.
      </p>
    );

  return (
    <>
      <ol className="priority-list">
        {tasks.map((task, index) => {
          const isTop = index === 0;
          const isDragging = draggedId === task.id;
          const isOver = dragOverId === task.id;
          const dueDate = task.due_date
            ? new Date(task.due_date).toLocaleDateString()
            : null;
          const isOverdue =
            task.due_date && new Date(task.due_date) < new Date();

          return (
            <li
              key={task.id}
              className={`priority-row${isTop ? " priority-row--top" : ""}${isDragging ? " priority-row--dragging" : ""}${isOver ? " priority-row--over" : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, task.id)}
              onDragEnd={handleDragEnd}
              onDragEnter={() => setDragOverId(task.id)}
              onDragLeave={() => setDragOverId(null)}
              onClick={() => setSelectedTask(task)}
            >
              {/* Drag handle */}
              <span className="priority-row__handle" title="Drag to reorder">
                ⠿
              </span>

              {/* Rank badge */}
              <span className={`priority-row__rank${isTop ? " priority-row__rank--top" : ""}`}>
                {index + 1}
              </span>

              {/* Content */}
              <div className="priority-row__content">
                <span className="priority-row__title">
                  {truncate(task.title, 60)}
                </span>
                {task.content && (
                  <span className="priority-row__body">
                    {truncate(task.content, 80)}
                  </span>
                )}
              </div>

              {/* Due date */}
              {dueDate && (
                <span
                  className={`priority-row__due${isOverdue ? " priority-row__due--overdue" : ""}`}
                >
                  {isOverdue ? "⚠ " : ""}Due {dueDate}
                </span>
              )}

              {/* Actions */}
              <div
                className="priority-row__actions"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="priority-row__btn priority-row__btn--complete"
                  onClick={(e) => handleComplete(e, task.id)}
                  title="Mark as complete"
                >
                  ✓
                </button>
                <button
                  className="priority-row__btn priority-row__btn--delete"
                  onClick={(e) => handleDelete(e, task.id)}
                  title="Delete task"
                >
                  ✕
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <Modal
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title || ""}
        content={selectedTask?.content || ""}
        created_at={selectedTask?.created_at || ""}
        updated_at={selectedTask?.updated_at}
        due_date={selectedTask?.due_date}
        is_completed={selectedTask?.is_completed}
      />
    </>
  );
}
