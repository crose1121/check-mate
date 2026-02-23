import { useEffect, useState } from "react";
import TaskGrid from "./TaskGrid";
import Modal from "./Modal";
import { useAuth } from "../hooks/useAuth";
import "./PriorityList.css";

interface TaskType {
  id: string;
  title: string;
  content: string;
  created_at: string;
  due_date?: string | null;
  updated_at?: string;
  is_completed: boolean;
}

const PRIORITY_STORAGE_KEY = "priorityOrder";

const getUpdatedTime = (task: TaskType) =>
  new Date(task.updated_at ?? task.created_at).getTime();

const getPriorityOrder = (): string[] => {
  try {
    const stored = localStorage.getItem(PRIORITY_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed
          .filter(
            (value) => typeof value === "string" || typeof value === "number",
          )
          .map((value) => String(value))
      : [];
  } catch {
    return [];
  }
};

const persistPriorityOrder = (orderedTasks: TaskType[]) => {
  const order = orderedTasks.map((task) => task.id);
  localStorage.setItem(PRIORITY_STORAGE_KEY, JSON.stringify(order));
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

export default function PriorityList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [suppressActionsUntil, setSuppressActionsUntil] = useState(0);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const userId = user?.id;
        if (userId === "guest-user") {
          setTasks([]);
          return;
        }

        const endpoint = userId
          ? `http://localhost:4000/tasks/active?userId=${encodeURIComponent(userId)}`
          : "http://localhost:4000/tasks/active";
        const response = await fetch(endpoint);
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

    fetchNotes();
  }, [user?.id]);

  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    setDraggedId(noteId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId === null || draggedId === targetId) return;

    const draggedIndex = tasks.findIndex((task) => task.id === draggedId);
    const targetIndex = tasks.findIndex((task) => task.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTasks = [...tasks];
    const [draggedTask] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedTask);

    setTasks(newTasks);
    persistPriorityOrder(newTasks);
    setDraggedId(null);
    setDragOverId(null);
    setSuppressActionsUntil(Date.now() + 250);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
    setSuppressActionsUntil(Date.now() + 250);
  };

  const handleDragEnter = (noteId: string) => {
    setDragOverId(noteId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleTaskComplete = (id: string) => {
    const nextTasks = tasks.filter((task) => task.id !== id);
    setTasks(nextTasks);
    persistPriorityOrder(nextTasks);
  };

  const handleTaskDelete = (id: string) => {
    const nextTasks = tasks.filter((task) => task.id !== id);
    setTasks(nextTasks);
    persistPriorityOrder(nextTasks);
  };

  if (loading)
    return (
      <div className="priority-state">
        <p>Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="priority-state">
        <p>Error: {error}</p>
      </div>
    );

  return (
    <>
      {tasks.length === 0 ? (
        <p className="priority-empty">
          Create tasks before creating a priority list
        </p>
      ) : (
        <div className="priority-list">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className="priority-item"
              onDragEnter={() => handleDragEnter(task.id)}
              onDragLeave={handleDragLeave}
            >
              <div className={`priority-rank ${index === 0 ? "top" : ""}`}>
                <span className="priority-number">{index + 1}</span>
                <span className="priority-label">
                  {index === 0 ? "Top" : `Priority ${index + 1}`}
                </span>
              </div>
              <div className="priority-card">
                <TaskGrid
                  id={task.id}
                  title={task.title}
                  content={task.content}
                  created_at={task.created_at}
                  due_date={task.due_date}
                  is_completed={task.is_completed}
                  isDragging={draggedId === task.id}
                  dragOverId={dragOverId}
                  onSelect={setSelectedTask}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  isDraggable={true}
                  showCheckmark={true}
                  suppressActionsUntil={suppressActionsUntil}
                  onComplete={handleTaskComplete}
                  onDelete={handleTaskDelete}
                />
              </div>
            </div>
          ))}
        </div>
      )}

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
