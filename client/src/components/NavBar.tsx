import { Link } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="logo">
            <span className="brand">
              <span className="brand-task">Task</span>
              <span className="brand-buddy">Buddy</span>
            </span>
          </Link>
        </div>

        <div className="nav-right"></div>
      </div>
    </nav>
  );
}
