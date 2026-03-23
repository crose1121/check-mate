import { useState, useRef } from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import "./SortSelector.css";

type SortType = "priority" | "oldest" | "newest" | "active" | "complete";

interface SortSelectorProps {
  currentSort: SortType;
  onSortChange: (sort: SortType) => void;
}

export default function SortSelector({
  currentSort,
  onSortChange,
}: SortSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setIsOpen(false));

  const handleSortSelect = (sort: SortType) => {
    onSortChange(sort);
    setIsOpen(false);
  };

  const sortLabels: Record<SortType, string> = {
    priority: "Priority",
    oldest: "Oldest",
    newest: "Newest",
    active: "Active",
    complete: "Completed",
  };

  return (
    <div className="sort-selector" ref={menuRef}>
      <button
        className="sort-selector-toggle"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        Sort: {sortLabels[currentSort]}
        <svg
          className={`sort-selector-arrow ${isOpen ? "open" : ""}`}
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
        <div className="sort-selector-menu">
          {(
            ["priority", "oldest", "newest", "active", "complete"] as SortType[]
          ).map((sortType) => (
            <button
              key={sortType}
              className={`sort-option ${
                currentSort === sortType ? "active" : ""
              }`}
              type="button"
              onClick={() => handleSortSelect(sortType)}
            >
              {sortLabels[sortType]}
              {currentSort === sortType && <span className="checkmark">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
