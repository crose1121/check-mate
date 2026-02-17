import { useState, useRef, useEffect } from "react";
import "./ViewMenu.css";

interface ViewMenuProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  tasksPerPage: number;
  onTasksPerPageChange: (count: number) => void;
}

export default function ViewMenu({
  viewMode,
  onViewModeChange,
  tasksPerPage,
  onTasksPerPageChange,
}: ViewMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(tasksPerPage.toString());
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTasksPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleApply = () => {
    const value = parseInt(inputValue, 10);
    if (!isNaN(value) && value > 0 && value <= 100) {
      onTasksPerPageChange(value);
    } else {
      setInputValue(tasksPerPage.toString());
    }
  };

  const handleClear = () => {
    setInputValue("");
    onTasksPerPageChange(9999);
  };

  const isValidInput = () => {
    const value = parseInt(inputValue, 10);
    return !isNaN(value) && value > 0 && value <= 100;
  };

  return (
    <div className="view-menu" ref={menuRef}>
      <button
        className="view-menu-toggle"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        View
        <svg
          className={`view-menu-arrow ${isOpen ? "open" : ""}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="view-menu-content">
          <div className="view-field">
            <label className="view-radio-label">
              <input
                type="radio"
                name="viewMode"
                value="grid"
                checked={viewMode === "grid"}
                onChange={(e) =>
                  onViewModeChange(e.target.value as "grid" | "list")
                }
              />
              <span>Grid View</span>
            </label>
          </div>

          <div className="view-field">
            <label className="view-radio-label">
              <input
                type="radio"
                name="viewMode"
                value="list"
                checked={viewMode === "list"}
                onChange={(e) =>
                  onViewModeChange(e.target.value as "grid" | "list")
                }
              />
              <span>List View</span>
            </label>
          </div>

          <div className="view-field view-divider">
            <label htmlFor="tasks-per-page" className="view-label">
              Tasks per page
            </label>
            <div className="tasks-per-page-input-group">
              <button
                className="clear-button"
                onClick={handleClear}
                type="button"
              >
                Clear
              </button>
              <input
                id="tasks-per-page"
                type="text"
                className="view-text-input"
                value={inputValue}
                onChange={handleTasksPerPageChange}
                placeholder="15"
                maxLength={3}
              />
              <button
                className="apply-button"
                onClick={handleApply}
                disabled={!isValidInput()}
                type="button"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
