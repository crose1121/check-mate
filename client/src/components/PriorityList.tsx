import { useEffect, useState } from "react";
import TaskGrid from "./TaskGrid";
import Modal from "./Modal";
import "./PriorityList.css";

interface TaskType {
  id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at?: string;
  completed: boolean;
}

const PRIORITY_STORAGE_KEY = "priorityOrder";

const getUpdatedTime = (task: TaskType) =>
  new Date(task.updated_at ?? task.created_at).getTime();

const getPriorityOrder = (): number[] => {
  try {
    const stored = localStorage.getItem(PRIORITY_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(Number.isInteger) : [];
  } catch {
    return [];
  }
};

const persistPriorityOrder = (orderedTasks: TaskType[]) => {
  const order = orderedTasks.map((task) => task.id);
  localStorage.setItem(PRIORITY_STORAGE_KEY, JSON.stringify(order));
};

const sortByPriority = (tasks: TaskType[], order: number[]) => {
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
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [suppressActionsUntil, setSuppressActionsUntil] = useState(0);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("http://localhost:4000/tasks/active");
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
  }, []);

  const handleDragStart = (e: React.DragEvent, noteId: number) => {
    setDraggedId(noteId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
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

  const handleDragEnter = (noteId: number) => {
    setDragOverId(noteId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleTaskComplete = (id: number) => {
    const nextTasks = tasks.filter((task) => task.id !== id);
    setTasks(nextTasks);
    persistPriorityOrder(nextTasks);
  };

  const handleTaskDelete = (id: number) => {
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
        <p className="priority-empty">No active tasks. Create one!</p>
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
                  body={task.body}
                  created_at={task.created_at}
                  completed={task.completed}
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
        body={selectedTask?.body || ""}
        created_at={selectedTask?.created_at || ""}
      />
    </>
  );
}
