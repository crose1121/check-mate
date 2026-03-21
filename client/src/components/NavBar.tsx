import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AppTitle from "./AppTitle";
import "./NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();
  const { user, setUser, setToken } = useAuth();

  const handleAuthClick = () => {
    setUser(null);
    setToken(null);
    navigate("/");
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-center">
          <Link to="/" className={`logo ${user ? "logo-with-sidenav" : ""}`}>
            <AppTitle height={30} width={30} />
          </Link>
        </div>

        {user && (
          <div className="nav-right">
            <button
              type="button"
              className="nav-link nav-auth-btn"
              onClick={handleAuthClick}
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
