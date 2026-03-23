import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import TaskGrid from "../components/TaskGrid";
import SortSelector from "../components/SortSelector";
import FilterMenu from "../components/FilterMenu";
import ViewMenu from "../components/ViewMenu";
import Modal from "../components/Modal";
import { apiCall } from "../lib/api";
import { getPriorityOrder, setPriorityOrder } from "../lib/priorityUtils";
import { useAuth } from "../hooks/useAuth";
import type { Task as TaskType } from "../types";
import "./AllTasks.css";

type SortType = "priority" | "oldest" | "newest" | "active" | "complete";

const truncate = (text: string, max: number) =>
  text.length > max ? text.substring(0, max) + "…" : text;

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
  const [viewMode, setViewMode] = useState<"grid" | "priority">("grid");
  const [tasksPerPage, setTasksPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  // Priority list drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [priorityOrderState, setPriorityOrderState] = useState<string[]>(() =>
    getPriorityOrder(),
  );

  const getUpdatedTime = (task: TaskType) =>
    new Date(task.updated_at ?? task.created_at).getTime();

  const syncPriorityOrder = (taskList: TaskType[]) => {
    try {
      const existing = getPriorityOrder();
      const ids = taskList
        .filter((task) => !task.is_completed)
        .map((task) => task.id);
      const preserved = existing.filter((id) => ids.includes(id));
      const missing = ids.filter((id) => !preserved.includes(id));
      const nextOrder = [...preserved, ...missing];
      setPriorityOrder(nextOrder);
      setPriorityOrderState(nextOrder);
      return nextOrder;
    } catch {
      return [];
    }
  };

  const sortByOldest = (taskList: TaskType[]) =>
    [...taskList].sort((a, b) => getUpdatedTime(a) - getUpdatedTime(b));

  const sortByNewest = (taskList: TaskType[]) =>
    [...taskList].sort((a, b) => getUpdatedTime(b) - getUpdatedTime(a));

  const sortByActive = (taskList: TaskType[]) =>
    [...taskList].sort((a, b) => {
      if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
      return getUpdatedTime(b) - getUpdatedTime(a);
    });

  const sortByCompleted = (taskList: TaskType[]) =>
    [...taskList].sort((a, b) => {
      if (b.is_completed !== a.is_completed) return b.is_completed ? 1 : -1;
      return getUpdatedTime(b) - getUpdatedTime(a);
    });

  const sortByPriorityOrder = (taskList: TaskType[]) => {
    const orderMap = new Map(
      priorityOrderState.map((id, index) => [id, index]),
    );
    return [...taskList].sort((a, b) => {
      const aIndex = orderMap.get(a.id);
      const bIndex = orderMap.get(b.id);
      if (aIndex !== undefined && bIndex !== undefined) return aIndex - bIndex;
      if (aIndex !== undefined) return -1;
      if (bIndex !== undefined) return 1;
      return getUpdatedTime(b) - getUpdatedTime(a);
    });
  };

  const locationState = location.state as { refresh?: number } | undefined;

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = user?.id;
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
  }, [location.pathname, user?.id, locationState?.refresh]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortType, searchText, showPending, showCompleted]);

  // ── Grid view handlers ─────────────────────────────────
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

  // ── Priority list drag handlers ────────────────────────
  const handlePriorityDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handlePriorityDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handlePriorityDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const orderMap = new Map(
      priorityOrderState.map((id, i) => [id, i]),
    );
    const activeTasks = tasks.filter((t) => !t.is_completed);
    const sorted = [...activeTasks].sort((a, b) => {
      const ai = orderMap.get(a.id);
      const bi = orderMap.get(b.id);
      if (ai !== undefined && bi !== undefined) return ai - bi;
      if (ai !== undefined) return -1;
      if (bi !== undefined) return 1;
      return getUpdatedTime(b) - getUpdatedTime(a);
    });

    const dragIndex = sorted.findIndex((t) => t.id === draggedId);
    const targetIndex = sorted.findIndex((t) => t.id === targetId);
    if (dragIndex === -1 || targetIndex === -1) return;

    const reordered = [...sorted];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const newOrder = reordered.map((t) => t.id);
    setPriorityOrderState(newOrder);
    setPriorityOrder(newOrder);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handlePriorityDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // ── Priority list action handlers ──────────────────────
  const handlePriorityComplete = async (
    e: React.MouseEvent,
    taskId: string,
  ) => {
    e.stopPropagation();
    try {
      const userId = user?.id;
      const endpoint = userId
        ? `/tasks/${taskId}/complete?userId=${encodeURIComponent(userId)}`
        : `/tasks/${taskId}/complete`;
      const response = await apiCall(endpoint, { method: "PUT" });
      if (!response.ok) throw new Error("Failed to complete task");
      handleTaskComplete(taskId);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePriorityDelete = async (
    e: React.MouseEvent,
    taskId: string,
  ) => {
    e.stopPropagation();
    try {
      const userId = user?.id;
      const endpoint = userId
        ? `/tasks/${taskId}?userId=${encodeURIComponent(userId)}`
        : `/tasks/${taskId}`;
      const response = await apiCall(endpoint, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete task");
      handleTaskDelete(taskId);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Loading / error states ─────────────────────────────
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

  // ── Grid view derived data ─────────────────────────────
  const filteredTasks = tasks
    .filter((task) => {
      const pendingMatch = showPending && !task.is_completed;
      const completedMatch = showCompleted && task.is_completed;
      return pendingMatch || completedMatch;
    })
    .filter((task) =>
      searchText === ""
        ? true
        : task.title.toLowerCase().includes(searchText.toLowerCase()) ||
          task.content.toLowerCase().includes(searchText.toLowerCase()),
    );

  const getSortedTasks = (taskList: TaskType[]) => {
    switch (sortType) {
      case "priority": return sortByPriorityOrder(taskList);
      case "oldest":   return sortByOldest(taskList);
      case "newest":   return sortByNewest(taskList);
      case "active":   return sortByActive(taskList.filter((t) => !t.is_completed));
      case "complete": return sortByCompleted(taskList);
      default:         return sortByNewest(taskList);
    }
  };

  const sortedTasks   = getSortedTasks(filteredTasks);
  const totalPages    = Math.ceil(sortedTasks.length / tasksPerPage);
  const paginatedTasks = sortedTasks.slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage,
  );
  const noTasksToDisplay = sortedTasks.length === 0;
  const hasAnyTasks = tasks.length > 0;

  const priorityOrder = getPriorityOrder();
  const selectedPriorityIndex = (() => {
    if (!selectedTask) return undefined;
    const pos = priorityOrder.indexOf(selectedTask.id);
    return pos !== -1 ? pos + 1 : undefined;
  })();

  // ── Priority list derived data ─────────────────────────
  const priorityDisplayTasks = (() => {
    const orderMap = new Map(priorityOrderState.map((id, i) => [id, i]));
    return tasks
      .filter((t) => !t.is_completed)
      .sort((a, b) => {
        const ai = orderMap.get(a.id);
        const bi = orderMap.get(b.id);
        if (ai !== undefined && bi !== undefined) return ai - bi;
        if (ai !== undefined) return -1;
        if (bi !== undefined) return 1;
        return getUpdatedTime(b) - getUpdatedTime(a);
      });
  })();

  return (
    <div className="all-tasks-container">
      <div className="all-tasks-header">
        <div className="page-heading">
          <h2 className="page-heading-title">Tasks</h2>
        </div>
        <div className="all-tasks-actions">
          <ViewMenu
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            tasksPerPage={tasksPerPage}
            onTasksPerPageChange={(count) => {
              setTasksPerPage(count);
              setCurrentPage(1);
            }}
          />
          {viewMode === "grid" && (
            <>
              <FilterMenu
                showPending={showPending}
                onPendingChange={setShowPending}
                showCompleted={showCompleted}
                onCompletedChange={setShowCompleted}
                searchText={searchText}
                onSearchChange={setSearchText}
              />
              <SortSelector currentSort={sortType} onSortChange={setSortType} />
            </>
          )}
        </div>
      </div>

      {/* ── Priority list view ─────────────────────────── */}
      {viewMode === "priority" ? (
        priorityDisplayTasks.length === 0 ? (
          <p>No active tasks to prioritize. Create some tasks first!</p>
        ) : (
          <>
            <p className="priority-list-hint">
              Drag rows to reorder · Click a task to view details
            </p>
            <ol className="priority-list">
              {priorityDisplayTasks.map((task, index) => {
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
                    onDragStart={(e) => handlePriorityDragStart(e, task.id)}
                    onDragOver={handlePriorityDragOver}
                    onDrop={(e) => handlePriorityDrop(e, task.id)}
                    onDragEnd={handlePriorityDragEnd}
                    onDragEnter={() => setDragOverId(task.id)}
                    onDragLeave={() => setDragOverId(null)}
                    onClick={() => setSelectedTask(task)}
                  >
                    <span
                      className="priority-row__handle"
                      title="Drag to reorder"
                    >
                      ⠿
                    </span>

                    <span
                      className={`priority-row__rank${isTop ? " priority-row__rank--top" : ""}`}
                    >
                      {index + 1}
                    </span>

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

                    {dueDate && (
                      <span
                        className={`priority-row__due${isOverdue ? " priority-row__due--overdue" : ""}`}
                      >
                        {isOverdue ? "⚠ " : ""}Due {dueDate}
                      </span>
                    )}

                    <div
                      className="priority-row__actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="priority-row__btn priority-row__btn--complete"
                        onClick={(e) => handlePriorityComplete(e, task.id)}
                        title="Mark as complete"
                      >
                        ✓
                      </button>
                      <button
                        className="priority-row__btn priority-row__btn--delete"
                        onClick={(e) => handlePriorityDelete(e, task.id)}
                        title="Delete task"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )
      ) : (
        /* ── Grid view ──────────────────────────────────── */
        noTasksToDisplay ? (
          <p>
            {hasAnyTasks
              ? "No tasks match your filters."
              : "No tasks yet. Create one!"}
          </p>
        ) : (
          <>
            <div className="tasks-grid-layout">
              {paginatedTasks.map((task) => {
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
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="pagination-button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )
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
