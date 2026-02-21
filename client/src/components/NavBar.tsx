import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import checkMateLogo from "../assets/CheckMateLogo.png";
import "./NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();
  const { user, setUser, setToken } = useAuth();
  const isGuestUser = user?.id === "guest-user";

  const handleAuthClick = () => {
    setUser(null);
    setToken(null);
    navigate("/");
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className={`logo ${user ? "logo-with-sidenav" : ""}`}>
            <span className="brand">
              <img src={checkMateLogo} alt="CheckMate logo" className="brand-icon" />
              <span className="brand-text">
                <span className="brand-task">Check</span>
                <span className="brand-buddy">Mate</span>
              </span>
            </span>
          </Link>
        </div>

        {user && !isGuestUser && (
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
