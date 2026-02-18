import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./SideNav.css";

export default function SideNav() {
  const location = useLocation();
  const { user } = useAuth();

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
          <Link
            to="/tasks"
            className={`side-nav-link ${["/tasks", "/all"].includes(location.pathname) ? "active" : ""}`}
          >
            <span className="icon">📋</span>
            <span>All Tasks</span>
          </Link>
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
            to="/completed"
            className={`side-nav-link ${location.pathname === "/completed" ? "active" : ""}`}
          >
            <span className="icon">✅</span>
            <span>Completed Tasks</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
