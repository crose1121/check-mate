import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewTask.css";

export default function NewTask() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body: content }),
      });

      if (!response.ok) throw new Error("Failed to create task");

      // Reset form and navigate
      setTitle("");
      setContent("");
      navigate("/tasks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-task-container">
      <h1>Create a New Task</h1>

      {error && <p className="error-message">{error}</p>}

      <form className="new-task-form" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            value={title}
            placeholder="Enter task title..."
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label>
          Content
          <textarea
            value={content}
            placeholder="Write your task..."
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            required
          />
        </label>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Saving..." : "Save Task"}
        </button>
      </form>
    </div>
  );
}
