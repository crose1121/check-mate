import { useEffect, useState } from "react";
import TaskGrid from "../components/TaskGrid";
import Modal from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import "./TasksPage.css";

interface TaskType {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  is_completed: boolean;
  due_date?: string | null;
}

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
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
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user?.id]);

  const handleTaskComplete = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleTaskDelete = (id: string) => {
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
                content={task.content}
                created_at={task.created_at}
                due_date={task.due_date}
                is_completed={task.is_completed}
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
        content={selectedTask?.content || ""}
        created_at={selectedTask?.created_at || ""}
        updated_at={selectedTask?.updated_at}
        due_date={selectedTask?.due_date}
        is_completed={selectedTask?.is_completed}
      />
    </div>
  );
}
