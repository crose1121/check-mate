import { useState, useRef, useEffect } from "react";
import "./FilterMenu.css";

interface FilterMenuProps {
  showPending: boolean;
  onPendingChange: (include: boolean) => void;
  showCompleted: boolean;
  onCompletedChange: (include: boolean) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
}

export default function FilterMenu({
  showPending,
  onPendingChange,
  showCompleted,
  onCompletedChange,
  searchText,
  onSearchChange,
}: FilterMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className="filter-menu" ref={menuRef}>
      <button
        className="filter-menu-toggle"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        Filter
        <svg
          className={`filter-menu-arrow ${isOpen ? "open" : ""}`}
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
        <div className="filter-menu-content">
          <div className="filter-field">
            <label className="filter-checkbox-label">
              <span>Show Pending</span>
              <input
                type="checkbox"
                checked={showPending}
                onChange={(e) => onPendingChange(e.target.checked)}
              />
            </label>
            <label className="filter-checkbox-label">
              <span>Show Completed</span>
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => onCompletedChange(e.target.checked)}
              />
            </label>
          </div>

          <div className="filter-field filter-divider">
            <input
              type="text"
              className="filter-text-input"
              placeholder="Filter by text..."
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
