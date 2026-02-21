import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import TaskGrid from "../components/TaskGrid";
import SortSelector from "../components/SortSelector";
import FilterMenu from "../components/FilterMenu";
import ViewMenu from "../components/ViewMenu";
import Modal from "../components/Modal";
import { apiCall } from "../lib/api";
import "./AllTasks.css";

type SortType = "priority" | "oldest" | "newest" | "active" | "complete";

interface TaskType {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  is_completed: boolean;
}

export default function AllTasks() {
  const location = useLocation();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [sortType, setSortType] = useState<SortType>("newest");
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [tasksPerPage, setTasksPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const getUpdatedTime = (task: TaskType) =>
    new Date(task.updated_at ?? task.created_at).getTime();

  const getPriorityOrder = (): number[] => {
    try {
      const stored = localStorage.getItem("priorityOrder");
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.filter(Number.isInteger) : [];
    } catch {
      return [];
    }
  };

  const sortByRecent = (taskList: TaskType[]) =>
    [...taskList].sort((a, b) => {
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }

      return getUpdatedTime(b) - getUpdatedTime(a);
    });

  const sortByOldest = (taskList: TaskType[]) =>
    [...taskList].sort((a, b) => {
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }

      return getUpdatedTime(a) - getUpdatedTime(b);
    });

  const sortByNewest = (taskList: TaskType[]) =>
    [...taskList].sort((a, b) => {
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }

      return getUpdatedTime(b) - getUpdatedTime(a);
    });

  const sortByActive = (taskList: TaskType[]) =>
    [...taskList].sort((a, b) => {
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }

      return getUpdatedTime(b) - getUpdatedTime(a);
    });

  const sortByCompleted = (taskList: TaskType[]) =>
    [...taskList].sort((a, b) => {
      if (b.is_completed !== a.is_completed) {
        return b.is_completed ? 1 : -1;
      }

      return getUpdatedTime(b) - getUpdatedTime(a);
    });

  const sortByPriorityOrder = (taskList: TaskType[]) => {
    const order = getPriorityOrder();
    const orderMap = new Map(order.map((id, index) => [id, index]));

    return [...taskList].sort((a, b) => {
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }

      if (!a.is_completed && !b.is_completed) {
        const aIndex = orderMap.get(a.id);
        const bIndex = orderMap.get(b.id);

        if (aIndex !== undefined || bIndex !== undefined) {
          if (aIndex === undefined) return 1;
          if (bIndex === undefined) return -1;
          return aIndex - bIndex;
        }
      }

      return getUpdatedTime(b) - getUpdatedTime(a);
    });
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall("/tasks");
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
  }, [location.pathname]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortType, searchText, includeCompleted]);

  const handleTaskDelete = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleTaskComplete = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, is_completed: !task.is_completed } : task,
      ),
    );
  };

  if (loading)
    return (
      <div className="all-tasks-container">
        <p>Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="all-tasks-container">
        <p>Error: {error}</p>
      </div>
    );

  const filteredTasks = tasks
    .filter((task) => (includeCompleted ? true : !task.is_completed))
    .filter((task) =>
      searchText.toLowerCase() === ""
        ? true
        : task.title.toLowerCase().includes(searchText.toLowerCase()) ||
          task.content.toLowerCase().includes(searchText.toLowerCase()),
    );

  const getSortedTasks = (taskList: TaskType[]) => {
    switch (sortType) {
      case "priority":
        return sortByPriorityOrder(taskList);
      case "oldest":
        return sortByOldest(taskList);
      case "newest":
        return sortByNewest(taskList);
      case "active":
        return sortByActive(taskList.filter((task) => !task.is_completed));
      case "complete":
        return sortByCompleted(taskList);
      default:
        return sortByRecent(taskList);
    }
  };

  const sortedTasks = getSortedTasks(filteredTasks);

  const totalPages = Math.ceil(sortedTasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const paginatedTasks = sortedTasks.slice(startIndex, endIndex);

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  const handleTasksPerPageChange = (count: number) => {
    setTasksPerPage(count);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="all-tasks-container">
      <div className="all-tasks-header">
        <h2>All Tasks</h2>
        <div className="all-tasks-actions">
          <ViewMenu
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            tasksPerPage={tasksPerPage}
            onTasksPerPageChange={handleTasksPerPageChange}
          />
          <FilterMenu
            includeCompleted={includeCompleted}
            onCompletedChange={setIncludeCompleted}
            searchText={searchText}
            onSearchChange={setSearchText}
          />
          <SortSelector currentSort={sortType} onSortChange={setSortType} />
        </div>
      </div>
      {paginatedTasks.length === 0 && sortedTasks.length === 0 ? (
        <p>No tasks yet. Create one!</p>
      ) : (
        <>
          <div
            className={`tasks-grid-layout ${viewMode === "list" ? "list-view" : ""}`}
          >
            {paginatedTasks.map((task, index) => {
              const priorityOrder = getPriorityOrder();
              const priorityPosition = priorityOrder.indexOf(task.id);
              const priorityIndex =
                priorityPosition !== -1 ? priorityPosition + 1 : undefined;

              return (
                <div key={task.id}>
                  <TaskGrid
                    id={task.id}
                    title={task.title}
                    content={task.content}
                    created_at={task.created_at}
                    is_completed={task.is_completed}
                    onSelect={setSelectedTask}
                    onDelete={handleTaskDelete}
                    showCheckmark={true}
                    onComplete={handleTaskComplete}
                    priorityIndex={priorityIndex}
                  />
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="pagination-button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
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
