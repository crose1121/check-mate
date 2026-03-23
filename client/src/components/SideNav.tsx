import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./SideNav.css";

export default function SideNav() {
  const location = useLocation();
  const { user } = useAuth();
  const isPlanningRoute = ["/priority", "/calendar"].includes(
    location.pathname,
  );
  const [isPlanningOpen, setIsPlanningOpen] = useState(isPlanningRoute);

  if (!user) return null;

  return (
    <nav className="side-nav">
      <div className="side-nav-new-note">
        <Link
          to="/new"
          className="new-note-btn"
          state={{ background: location }}
        >
          ✚ New Task
        </Link>
      </div>

      <ul className="side-nav-list">
        <li>
          <Link
            to="/tasks"
            className={`side-nav-link ${["/tasks", "/all", "/"].includes(location.pathname) ? "active" : ""}`}
          >
            <span className="icon">📋</span>
            <span>Tasks</span>
          </Link>
        </li>

        <li>
          <button
            type="button"
            className={`side-nav-link side-nav-toggle ${isPlanningRoute ? "active" : ""}`}
            onClick={() => setIsPlanningOpen((prev) => !prev)}
          >
            <span className="icon">📅</span>
            <span>Planning</span>
            <span className="side-nav-chevron" aria-hidden="true">
              {isPlanningOpen ? "▾" : "▸"}
            </span>
          </button>

          {isPlanningOpen && (
            <ul className="side-nav-sublist">
              <li>
                <Link
                  to="/priority"
                  className={`side-nav-link side-nav-sublink ${location.pathname === "/priority" ? "active" : ""}`}
                >
                  <span>Priority List</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/calendar"
                  className={`side-nav-link side-nav-sublink ${location.pathname === "/calendar" ? "active" : ""}`}
                >
                  <span>Calendar</span>
                </Link>
              </li>
            </ul>
          )}
        </li>

        <li>
          <Link
            to="/achievements"
            className={`side-nav-link ${location.pathname === "/achievements" ? "active" : ""}`}
          >
            <span className="icon">🏆</span>
            <span>Achievements</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
