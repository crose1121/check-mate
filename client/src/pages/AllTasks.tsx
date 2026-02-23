import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import TaskGrid from "../components/TaskGrid";
import SortSelector from "../components/SortSelector";
import FilterMenu from "../components/FilterMenu";
import ViewMenu from "../components/ViewMenu";
import Modal from "../components/Modal";
import { apiCall } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import "./AllTasks.css";

type SortType = "priority" | "oldest" | "newest" | "active" | "complete";

interface TaskType {
  id: string;
  title: string;
  content: string;
  created_at: string;
  due_date?: string | null;
  updated_at?: string;
  is_completed: boolean;
}

export default function AllTasks() {
  const { user } = useAuth();
  const location = useLocation();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [sortType, setSortType] = useState<SortType>("newest");
  const [showPending, setShowPending] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [tasksPerPage, setTasksPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const getUpdatedTime = (task: TaskType) =>
    new Date(task.updated_at ?? task.created_at).getTime();

  const getPriorityOrder = (): string[] => {
    try {
      const stored = localStorage.getItem("priorityOrder");
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

  const syncPriorityOrder = (taskList: TaskType[]) => {
    try {
      const existing = getPriorityOrder();
      const ids = taskList.filter((task) => !task.is_completed).map((task) => task.id);
      const preserved = existing.filter((id) => ids.includes(id));
      const missing = ids.filter((id) => !preserved.includes(id));
      const nextOrder = [...preserved, ...missing];
      localStorage.setItem("priorityOrder", JSON.stringify(nextOrder));
      return nextOrder;
    } catch {
      return [];
    }
  };

  const sortByRecent = (taskList: TaskType[]) =>
    [...taskList].sort((a, b) => getUpdatedTime(b) - getUpdatedTime(a));

  const sortByOldest = (taskList: TaskType[]) =>
    [...taskList].sort((a, b) => getUpdatedTime(a) - getUpdatedTime(b));

  const sortByNewest = (taskList: TaskType[]) =>
    [...taskList].sort((a, b) => getUpdatedTime(b) - getUpdatedTime(a));

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

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);

      try {
        const userId = user?.id;
        if (userId === "guest-user") {
          setTasks([]);
          return;
        }

        const endpoint = userId
          ? `/tasks?userId=${encodeURIComponent(userId)}`
          : "/tasks";
        const response = await apiCall(endpoint);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        syncPriorityOrder(data);
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [location.pathname, user?.id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortType, searchText, showPending, showCompleted]);

  const handleTaskDelete = (id: string) => {
    setTasks((prev) => {
      const next = prev.filter((task) => task.id !== id);
      syncPriorityOrder(next);
      return next;
    });
  };

  const handleTaskComplete = (id: string) => {
    setTasks((prev) => {
      const next = prev.map((task) =>
        task.id === id ? { ...task, is_completed: !task.is_completed } : task,
      );
      syncPriorityOrder(next);
      return next;
    });
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
    .filter((task) => {
      const pendingMatch = showPending && !task.is_completed;
      const completedMatch = showCompleted && task.is_completed;
      return pendingMatch || completedMatch;
    })
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
  const noTasksToDisplay = sortedTasks.length === 0;
  const hasAnyTasks = tasks.length > 0;

  const selectedPriorityIndex = (() => {
    if (!selectedTask) return undefined;
    const order = getPriorityOrder();
    const pos = order.indexOf(selectedTask.id);
    return pos !== -1 ? pos + 1 : undefined;
  })();

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
        <div className="page-heading">
          <p className="page-heading-subtitle">Tasks</p>
          <h2 className="page-heading-title">All Tasks</h2>
        </div>
        <div className="all-tasks-actions">
          <ViewMenu
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            tasksPerPage={tasksPerPage}
            onTasksPerPageChange={handleTasksPerPageChange}
          />
          <FilterMenu
            showPending={showPending}
            onPendingChange={setShowPending}
            showCompleted={showCompleted}
            onCompletedChange={setShowCompleted}
            searchText={searchText}
            onSearchChange={setSearchText}
          />
          <SortSelector currentSort={sortType} onSortChange={setSortType} />
        </div>
      </div>
      {noTasksToDisplay ? (
        <p>
          {hasAnyTasks
            ? "No tasks match your filters."
            : "No tasks yet. Create one!"}
        </p>
      ) : (
        <>
          <div
            className={`tasks-grid-layout ${viewMode === "list" ? "list-view" : ""}`}
          >
            {paginatedTasks.map((task) => {
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
                    due_date={task.due_date}
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
        updated_at={selectedTask?.updated_at}
        due_date={selectedTask?.due_date}
        is_completed={selectedTask?.is_completed}
        priorityIndex={selectedPriorityIndex}
      />
    </div>
  );
}
