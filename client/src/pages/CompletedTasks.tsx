import { useEffect, useState } from "react";
import Task from "../components/Task";
import Modal from "../components/Modal";
import "./TasksPage.css";

interface TaskType {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  is_completed: boolean;
}

export default function CompletedTasks() {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:4000/tasks/completed");
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleTaskUncomplete = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleTaskDelete = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  if (loading)
    return (
      <div className="tasks-container">
        <p>Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="tasks-container">
        <p>Error: {error}</p>
      </div>
    );

  return (
    <div className="tasks-container">
      <h2>Completed Tasks</h2>
      {tasks.length === 0 ? (
        <p>No completed tasks yet.</p>
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => (
            <Task
              key={task.id}
              id={task.id}
              title={task.title}
              content={task.content}
              created_at={task.created_at}
              updated_at={task.updated_at}
              is_completed={task.is_completed}
              onSelect={setSelectedTask}
              onComplete={handleTaskUncomplete}
              onDelete={handleTaskDelete}
            />
          ))}
        </div>
      )}
      <Modal
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title || ""}
        content={selectedTask?.content || ""}
        created_at={selectedTask?.created_at || ""}
      />
    </div>
  );
}
