import { useEffect, useMemo, useState } from "react";
import Modal from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import { apiCall } from "../lib/api";
import "./CalendarPage.css";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Task = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  due_date?: string | null;
  is_completed: boolean;
  priorityIndex?: number;
};

const PRIORITY_STORAGE_KEY = "priorityOrder";
const PRIORITY_COLORS = [
  "#ff6b6b",
  "#ffa24c",
  "#7bdff2",
  "#6aa6ff",
  "#9b8cff",
  "#b7c4ff",
];

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

const getPriorityIndex = (orderMap: Map<string, number>, taskId: string) => {
  const position = orderMap.get(taskId);
  if (position === undefined) return undefined;
  return Math.min(position + 1, PRIORITY_COLORS.length);
};

export default function CalendarPage() {
  const { user } = useAuth();
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth());
  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.id || user.id === "guest-user") {
        setTasksByDate({});
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const endpoint = `/tasks?userId=${encodeURIComponent(user.id)}`;
        const response = await apiCall(endpoint);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = (await response.json()) as Task[];
        const priorityOrder = getPriorityOrder();
        const priorityOrderMap = new Map(
          priorityOrder.map((id, index) => [id, index]),
        );

        const grouped: Record<string, Task[]> = {};
        data.forEach((task) => {
          if (!task.due_date) return;
          const key = buildDateKey(task.due_date);
          if (!key) return;
          const priorityIndex = getPriorityIndex(priorityOrderMap, task.id);
          const taskWithPriority = { ...task, priorityIndex };
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(taskWithPriority);
        });

        setTasksByDate(grouped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setTasksByDate({});
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user?.id]);

  const buildDateKey = (dateString: string): string | null => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().split("T")[0];
  };

  const { weeks, isToday } = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const cells: Array<number | null> = [
      ...Array(startWeekday).fill(null),
      ...Array.from({ length: daysInMonth }, (_, idx) => idx + 1),
    ];

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    const weeksChunked: Array<Array<number | null>> = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeksChunked.push(cells.slice(i, i + 7));
    }

    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    const isTodayCheck = (day: number | null) =>
      day !== null &&
      currentYear === todayYear &&
      currentMonth === todayMonth &&
      day === todayDate;

    return { weeks: weeksChunked, isToday: isTodayCheck };
  }, [currentMonth, currentYear, today]);

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((year) => year - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((year) => year + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const makeDateKey = (year: number, month: number, day: number) => {
    const utcDate = new Date(Date.UTC(year, month, day));
    return utcDate.toISOString().split("T")[0];
  };

  const resetToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const getPriorityClass = (priorityIndex?: number) => {
    if (!priorityIndex) return "";
    return `priority-${Math.min(priorityIndex, PRIORITY_COLORS.length)}`;
  };

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <div className="page-heading">
          <p className="page-heading-subtitle">Planning</p>
          <h2 className="page-heading-title">Calendar</h2>
        </div>
        <div className="calendar-controls">
          <button type="button" onClick={goToPreviousMonth}>
            ←
          </button>
          <button type="button" onClick={resetToToday}>
            Today
          </button>
          <button type="button" onClick={goToNextMonth}>
            →
          </button>
        </div>
      </div>

      <div className="calendar-month-meta">
        <span className="calendar-month-label">
          {monthNames[currentMonth]} {currentYear}
        </span>
      </div>

      {error && <div className="calendar-status error">{error}</div>}
      {loading && <div className="calendar-status">Loading tasks...</div>}

      <div className="calendar-grid">
        {weekdayLabels.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className={`calendar-day ${day === null ? "empty" : ""} ${
                isToday(day) ? "today" : ""
              }`}
            >
              {day !== null ? (
                <>
                  <div className="calendar-day-header">
                    <span className="calendar-day-number">{day}</span>
                  </div>
                  <div className="calendar-day-tasks">
                    {(
                      tasksByDate[
                        makeDateKey(currentYear, currentMonth, day)
                      ] || []
                    ).map((task) => (
                      <div
                        key={task.id}
                        className={`calendar-task ${task.is_completed ? "completed" : ""}`}
                        onClick={() => setSelectedTask(task)}
                      >
                        {!task.is_completed && (
                          <span
                            className={`task-dot ${getPriorityClass(task.priorityIndex) || "pending"}`}
                            aria-hidden
                          />
                        )}
                        <span className="calendar-task-title">
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                ""
              )}
            </div>
          )),
        )}
      </div>

      <Modal
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title || ""}
        content={selectedTask?.content || ""}
        created_at={selectedTask?.created_at || ""}
        updated_at={selectedTask?.updated_at}
        due_date={selectedTask?.due_date}
        is_completed={selectedTask?.is_completed}
        priorityIndex={selectedTask?.priorityIndex}
      />
    </div>
  );
}
