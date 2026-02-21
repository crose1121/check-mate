import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./SideNav.css";

export default function SideNav() {
  const location = useLocation();
  const { user } = useAuth();
  const isTasksRoute = ["/tasks", "/all", "/completed"].includes(
    location.pathname,
  );
  const [isTasksOpen, setIsTasksOpen] = useState(isTasksRoute);

  // Only show sidenav if user is logged in
  if (!user) return null;

  return (
    <nav className="side-nav">
      <div className="side-nav-new-note">
        <Link to="/new" className="new-note-btn">
          ✚ New Task
        </Link>
      </div>

      <ul className="side-nav-list">
        <li>
          <button
            type="button"
            className={`side-nav-link side-nav-toggle ${isTasksRoute ? "active" : ""}`}
            onClick={() => setIsTasksOpen((prev) => !prev)}
          >
            <span className="icon">📋</span>
            <span>Tasks</span>
            <span className="side-nav-chevron" aria-hidden="true">
              {isTasksOpen ? "▾" : "▸"}
            </span>
          </button>

          {isTasksOpen && (
            <ul className="side-nav-sublist">
              <li>
                <Link
                  to="/tasks"
                  className={`side-nav-link side-nav-sublink ${["/tasks", "/all"].includes(location.pathname) ? "active" : ""}`}
                >
                  <span>All Tasks</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/completed"
                  className={`side-nav-link side-nav-sublink ${location.pathname === "/completed" ? "active" : ""}`}
                >
                  <span>Completed Tasks</span>
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <Link
            to="/priority"
            className={`side-nav-link ${location.pathname === "/priority" ? "active" : ""}`}
          >
            <span className="icon">⭐</span>
            <span>Priority List</span>
          </Link>
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
