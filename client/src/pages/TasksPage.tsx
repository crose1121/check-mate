import { useEffect, useState } from "react";
import TaskGrid from "../components/TaskGrid";
import Modal from "../components/Modal";
import "./TasksPage.css";

interface TaskType {
  id: number;
  title: string;
  body: string;
  created_at: string;
  completed: boolean;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:4000/tasks/active");
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

  const handleTaskComplete = (id: number) => {
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
      <h2>Active Tasks</h2>
      {tasks.length === 0 ? (
        <p>No active tasks. Create one!</p>
      ) : (
        <div className="tasks-grid-layout">
          {tasks.map((task) => (
            <div key={task.id}>
              <TaskGrid
                id={task.id}
                title={task.title}
                body={task.body}
                created_at={task.created_at}
                completed={task.completed}
                onSelect={setSelectedTask}
                showCheckmark={true}
                onComplete={handleTaskComplete}
                onDelete={handleTaskDelete}
              />
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
    </div>
  );
}
